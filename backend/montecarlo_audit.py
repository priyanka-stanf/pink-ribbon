#!/usr/bin/env python3
"""
Monte Carlo simulation audit and validation module.

Can be run as a script (python montecarlo_audit.py) or imported as a test suite.
Validates that the simulation engine satisfies standard MC practices:

  1. Reproducibility: same seed → identical results
  2. Stochasticity: different seed → different results
  3. Convergence: increasing N narrows intervals and stabilizes running mean
  4. Array validity: correct length, values in valid ranges
  5. Correct aggregation: recurrence prob = count/N
  6. Parameter uncertainty: HR varies across iterations (not fixed)
  7. Proof metadata: mc_proof block present with required fields
"""

import sys
import time
import json
import numpy as np

from models import PatientInput
from simulation_pathway_engine import run_projection, run_pathway, ITERATIONS_PER_PATHWAY
import params_treatment_effects as tx

# ── Test patient fixture ──────────────────────────────────────────────────

TEST_PATIENT = PatientInput(
    age=55, zip_code="10001", stage_at_diagnosis="II",
    er_positive=True, pr_positive=True, her2_positive=False,
)
TEST_STAGE = "II"
TEST_PATHWAY = "lumpectomy_radiation"


def _hr(msg: str):
    print(f"\n{'─' * 70}\n  {msg}\n{'─' * 70}")


# ══════════════════════════════════════════════════════════════════════════
#  TEST 1: Reproducibility — same seed → identical results
# ══════════════════════════════════════════════════════════════════════════

def test_reproducibility():
    _hr("TEST 1: Reproducibility (same seed → identical results)")
    seed = 12345

    r1 = run_projection(TEST_PATIENT, n_iterations=500, seed=seed)
    r2 = run_projection(TEST_PATIENT, n_iterations=500, seed=seed)

    assert r1["monte_carlo"]["random_seed"] == r2["monte_carlo"]["random_seed"] == seed, \
        "Seeds do not match"

    # Compare pathway-level recurrence means (must be exactly equal)
    for p1, p2 in zip(r1["pathways"], r2["pathways"]):
        if not p1.get("eligible"):
            continue
        rec1 = p1["probability_recurrence_5y"]
        rec2 = p2["probability_recurrence_5y"]
        assert rec1 == rec2, (
            f"Reproducibility FAILED for {p1['pathway']}: {rec1} != {rec2}"
        )
        # Also check cost and QALM
        assert p1["cost_distribution"]["median"] == p2["cost_distribution"]["median"], \
            f"Cost not reproducible for {p1['pathway']}"
        assert p1["mean_quality_adjusted_months_5y"] == p2["mean_quality_adjusted_months_5y"], \
            f"QALM not reproducible for {p1['pathway']}"

    print("  ✓ Same seed produces identical results (recurrence, cost, QALM)")
    print(f"    Seed used: {seed}")
    print(f"    Compared {sum(1 for p in r1['pathways'] if p.get('eligible'))} eligible pathways")


# ══════════════════════════════════════════════════════════════════════════
#  TEST 2: Stochasticity — different seeds → different results
# ══════════════════════════════════════════════════════════════════════════

def test_different_seeds():
    _hr("TEST 2: Stochasticity (different seeds → different results)")

    r1 = run_projection(TEST_PATIENT, n_iterations=500, seed=11111)
    r2 = run_projection(TEST_PATIENT, n_iterations=500, seed=99999)

    any_different = False
    for p1, p2 in zip(r1["pathways"], r2["pathways"]):
        if not p1.get("eligible"):
            continue
        if p1["probability_recurrence_5y"] != p2["probability_recurrence_5y"]:
            any_different = True
            break

    assert any_different, "Different seeds produced IDENTICAL results — RNG may be broken"
    print("  ✓ Different seeds produce different results")


# ══════════════════════════════════════════════════════════════════════════
#  TEST 3: Convergence — increasing N narrows intervals, stabilizes mean
# ══════════════════════════════════════════════════════════════════════════

def test_convergence():
    _hr("TEST 3: Convergence (N=1000 vs N=5000 interval width)")
    seed = 42

    rng_small = np.random.default_rng(seed)
    r_small = run_pathway(TEST_PATHWAY, TEST_STAGE, "10001", rng_small, n_iter=1000)

    rng_large = np.random.default_rng(seed)
    r_large = run_pathway(TEST_PATHWAY, TEST_STAGE, "10001", rng_large, n_iter=5000)

    # Recurrence interval should be narrower with larger N
    width_small = r_small["probability_recurrence_5y_95_si_high"] - r_small["probability_recurrence_5y_95_si_low"]
    width_large = r_large["probability_recurrence_5y_95_si_high"] - r_large["probability_recurrence_5y_95_si_low"]

    print(f"  N=1000: recurrence = {r_small['probability_recurrence_5y']:.4f}  "
          f"95% SI width = {width_small:.4f}")
    print(f"  N=5000: recurrence = {r_large['probability_recurrence_5y']:.4f}  "
          f"95% SI width = {width_large:.4f}")

    assert width_large <= width_small + 0.005, (
        f"Interval did not narrow with more iterations: "
        f"N=1000 width={width_small:.4f}, N=5000 width={width_large:.4f}"
    )
    print("  ✓ Interval narrows (or stays comparable) with larger N")

    # Convergence checkpoints should show stabilization
    ck = r_large["mc_proof"]["convergence_checkpoints"]
    assert len(ck) >= 3, "Too few convergence checkpoints"
    # Check that later checkpoints are close to final mean
    final_mean = r_large["probability_recurrence_5y"]
    last_ck_mean = ck[-1]["recurrence_running_mean"]
    penult_ck_mean = ck[-2]["recurrence_running_mean"]
    drift = abs(last_ck_mean - penult_ck_mean)
    print(f"  Convergence checkpoints: {[c['recurrence_running_mean'] for c in ck]}")
    print(f"  Drift between last two checkpoints: {drift:.6f}")
    assert drift < 0.02, f"Running mean not stabilized: drift={drift:.6f}"
    print("  ✓ Running mean stabilizes across checkpoints")


# ══════════════════════════════════════════════════════════════════════════
#  TEST 4: Array validity — correct length, valid ranges
# ══════════════════════════════════════════════════════════════════════════

def test_array_validity():
    _hr("TEST 4: Array validity (correct sizes and value ranges)")
    seed = 77
    n = 2000
    rng = np.random.default_rng(seed)
    r = run_pathway(TEST_PATHWAY, TEST_STAGE, "10001", rng, n_iter=n)

    # Check n_iterations matches
    assert r["n_iterations"] == n, f"n_iterations mismatch: {r['n_iterations']} != {n}"

    # Recurrence probability in [0, 1]
    rec = r["probability_recurrence_5y"]
    assert 0.0 <= rec <= 1.0, f"Recurrence out of range: {rec}"
    assert 0.0 <= r["probability_recurrence_5y_95_si_low"] <= r["probability_recurrence_5y_95_si_high"] <= 1.0

    # Cost non-negative
    assert r["cost_distribution"]["median"] >= 0, "Cost median is negative"
    assert r["cost_distribution"]["q1"] >= 0, "Cost Q1 is negative"
    assert r["cost_distribution"]["p2_5"] >= 0, "Cost p2.5 is negative"

    # Symptom months in [0, 60]
    sym_mean = r["expected_symptom_months_moderate_severe"]
    sym_lo, sym_hi = r["symptom_months_95_si"]
    assert 0.0 <= sym_lo <= sym_hi <= 60.0, f"Symptom months out of range: [{sym_lo}, {sym_hi}]"
    assert 0.0 <= sym_mean <= 60.0, f"Symptom months mean out of range: {sym_mean}"

    # QALM in [0, 60]
    qalm = r["mean_quality_adjusted_months_5y"]
    qalm_lo, qalm_hi = r["qalm_95_si"]
    assert 0.0 <= qalm_lo <= qalm_hi <= 60.0, f"QALM out of range: [{qalm_lo}, {qalm_hi}]"
    assert 0.0 <= qalm <= 60.0, f"QALM mean out of range: {qalm}"

    # Toxicity probability in [0, 1]
    tox = r["probability_major_long_term_side_effect"]
    assert 0.0 <= tox <= 1.0, f"Toxicity prob out of range: {tox}"

    # mc_proof.sample_sizes.total_iterations == n
    assert r["mc_proof"]["N"] == n
    assert r["mc_proof"]["sample_sizes"]["total_iterations"] == n

    # recurrence events <= N
    rec_events = r["mc_proof"]["sample_sizes"]["recurrence_events"]
    assert 0 <= rec_events <= n, f"Recurrence events out of range: {rec_events}"

    print(f"  ✓ n_iterations = {n}")
    print(f"  ✓ recurrence = {rec:.4f} in [0,1], SI = [{r['probability_recurrence_5y_95_si_low']:.4f}, {r['probability_recurrence_5y_95_si_high']:.4f}]")
    print(f"  ✓ cost median = ${r['cost_distribution']['median']:,.0f} ≥ 0")
    print(f"  ✓ symptom months = {sym_mean:.1f} in [0,60], SI = [{sym_lo:.1f}, {sym_hi:.1f}]")
    print(f"  ✓ QALM = {qalm:.1f} in [0,60], SI = [{qalm_lo:.1f}, {qalm_hi:.1f}]")
    print(f"  ✓ P(major LTE) = {tox:.4f} in [0,1]")
    print(f"  ✓ recurrence_events = {rec_events} ≤ N={n}")


# ══════════════════════════════════════════════════════════════════════════
#  TEST 5: Correct aggregation — recurrence = count / N
# ══════════════════════════════════════════════════════════════════════════

def test_aggregation():
    _hr("TEST 5: Correct aggregation (recurrence = events / N)")
    seed = 55
    n = 3000
    rng = np.random.default_rng(seed)
    r = run_pathway(TEST_PATHWAY, TEST_STAGE, "10001", rng, n_iter=n)

    rec_events = r["mc_proof"]["sample_sizes"]["recurrence_events"]
    rec_prob = r["probability_recurrence_5y"]
    expected = rec_events / n

    # Tolerance accounts for rounding to 5 decimal places in the output
    assert abs(rec_prob - expected) < 1e-4, (
        f"Aggregation mismatch: prob={rec_prob}, events/N={expected}"
    )
    print(f"  ✓ P(recurrence) = {rec_prob:.5f} ≈ {rec_events}/{n} = {expected:.7f} (Δ={abs(rec_prob - expected):.1e})")

    # Also verify QALM is between its SI bounds (mean should be within 95% interval)
    qalm = r["mean_quality_adjusted_months_5y"]
    qalm_lo, qalm_hi = r["qalm_95_si"]
    assert qalm_lo <= qalm <= qalm_hi, (
        f"QALM mean {qalm} not within its own 95% SI [{qalm_lo}, {qalm_hi}]"
    )
    print(f"  ✓ QALM mean {qalm:.2f} within SI [{qalm_lo:.2f}, {qalm_hi:.2f}]")


# ══════════════════════════════════════════════════════════════════════════
#  TEST 6: Parameter uncertainty — HR varies across iterations
# ══════════════════════════════════════════════════════════════════════════

def test_parameter_uncertainty():
    _hr("TEST 6: Parameter uncertainty (HR varies across iterations)")
    seed = 42
    rng = np.random.default_rng(seed)

    hrs = [tx.sample_recurrence_hr(TEST_PATHWAY, rng) for _ in range(1000)]
    hr_arr = np.array(hrs)

    hr_mean = float(np.mean(hr_arr))
    hr_std = float(np.std(hr_arr))
    hr_min = float(np.min(hr_arr))
    hr_max = float(np.max(hr_arr))

    expected_hr = tx.PATHWAY_HR_PARAMS[TEST_PATHWAY]["hr"]
    expected_ci_lo = tx.PATHWAY_HR_PARAMS[TEST_PATHWAY]["ci_low"]
    expected_ci_hi = tx.PATHWAY_HR_PARAMS[TEST_PATHWAY]["ci_high"]

    # Mean should be close to point estimate
    assert abs(hr_mean - expected_hr) < 0.1, (
        f"HR mean {hr_mean:.3f} too far from expected {expected_hr}"
    )
    # Standard deviation should be > 0 (not a constant)
    assert hr_std > 0.01, f"HR std too small ({hr_std:.4f}) — may not be sampling"
    # Range should span the CI
    assert hr_min < expected_ci_lo + 0.05, f"HR min {hr_min:.3f} not reaching lower CI"
    assert hr_max > expected_ci_hi - 0.05, f"HR max {hr_max:.3f} not reaching upper CI"

    print(f"  ✓ HR for '{TEST_PATHWAY}': expected={expected_hr}, CI=[{expected_ci_lo}, {expected_ci_hi}]")
    print(f"    Sampled 1000 HRs: mean={hr_mean:.4f}, std={hr_std:.4f}, range=[{hr_min:.4f}, {hr_max:.4f}]")
    print(f"  ✓ Parameter uncertainty confirmed: std={hr_std:.4f} > 0.01")

    # Verify clinical_trial has wider variance
    rng2 = np.random.default_rng(seed)
    hrs_ct = [tx.sample_recurrence_hr("clinical_trial", rng2) for _ in range(1000)]
    ct_std = float(np.std(hrs_ct))
    assert ct_std > hr_std, (
        f"Clinical trial HR std ({ct_std:.4f}) should be wider than {TEST_PATHWAY} ({hr_std:.4f})"
    )
    print(f"  ✓ Clinical trial HR has wider variance: std={ct_std:.4f} > {hr_std:.4f}")


# ══════════════════════════════════════════════════════════════════════════
#  TEST 7: mc_proof metadata block is present and complete
# ══════════════════════════════════════════════════════════════════════════

def test_mc_proof_metadata():
    _hr("TEST 7: mc_proof metadata block completeness")
    seed = 42
    r = run_projection(TEST_PATIENT, n_iterations=500, seed=seed)

    # Top-level monte_carlo block
    mc = r["monte_carlo"]
    assert mc["n_iterations"] == 500
    assert mc["random_seed"] == seed
    assert mc["runtime_seconds"] > 0
    print(f"  ✓ monte_carlo: N={mc['n_iterations']}, seed={mc['random_seed']}, runtime={mc['runtime_seconds']}s")

    # Per-pathway mc_proof blocks
    for p in r["pathways"]:
        if not p.get("eligible"):
            continue
        proof = p.get("mc_proof")
        assert proof is not None, f"mc_proof missing for {p['pathway']}"
        assert proof["N"] == 500, f"mc_proof.N wrong for {p['pathway']}"
        assert proof["runtime_seconds"] > 0

        # Convergence checkpoints
        ck = proof["convergence_checkpoints"]
        assert len(ck) >= 3, f"Too few convergence checkpoints for {p['pathway']}"
        for c in ck:
            assert "k" in c and "recurrence_running_mean" in c

        # Sample sizes
        ss = proof["sample_sizes"]
        assert ss["total_iterations"] == 500
        assert 0 <= ss["recurrence_events"] <= 500
        assert 0 <= ss["toxicity_events"] <= 500

        # Interval method documentation
        assert "empirical" in proof["interval_method"].lower()
        assert "parameter_uncertainty" in proof
        assert "patient_level_randomness" in proof

        print(f"  ✓ {p['pathway']}: mc_proof complete "
              f"(N={proof['N']}, runtime={proof['runtime_seconds']:.3f}s, "
              f"rec_events={ss['recurrence_events']}, tox_events={ss['toxicity_events']})")


# ══════════════════════════════════════════════════════════════════════════
#  TEST 8: No deterministic shortcuts — every pathway uses stochastic draws
# ══════════════════════════════════════════════════════════════════════════

def test_no_deterministic_shortcuts():
    _hr("TEST 8: No deterministic shortcuts (all pathways are stochastic)")
    seed = 42

    all_pathways = ["lumpectomy_radiation", "mastectomy_no_recon", "mastectomy_recon",
                    "chemotherapy_plus_surgery", "endocrine_therapy", "her2_targeted",
                    "clinical_trial"]

    for pw in all_pathways:
        rng = np.random.default_rng(seed)
        r1 = run_pathway(pw, "II", "10001", rng, n_iter=200)

        rng2 = np.random.default_rng(seed + 1)
        r2 = run_pathway(pw, "II", "10001", rng2, n_iter=200)

        # Results must differ between seeds (stochastic, not deterministic)
        differs = (
            r1["probability_recurrence_5y"] != r2["probability_recurrence_5y"]
            or r1["cost_distribution"]["median"] != r2["cost_distribution"]["median"]
            or r1["mean_quality_adjusted_months_5y"] != r2["mean_quality_adjusted_months_5y"]
        )
        assert differs, (
            f"Pathway '{pw}' produced identical results with different seeds — "
            f"may be using deterministic shortcut"
        )

        # Recurrence events must be present and make sense
        rec_events = r1["mc_proof"]["sample_sizes"]["recurrence_events"]
        rec_prob = r1["probability_recurrence_5y"]
        assert abs(rec_prob - rec_events / 200) < 1e-6, (
            f"Pathway '{pw}': recurrence prob ({rec_prob}) != events/N ({rec_events}/200)"
        )

        print(f"  ✓ {pw:35s} stochastic (rec={rec_prob:.3f}, events={rec_events}/200)")


# ══════════════════════════════════════════════════════════════════════════
#  TEST 9: RNG isolation — no global random state leakage
# ══════════════════════════════════════════════════════════════════════════

def test_rng_isolation():
    _hr("TEST 9: RNG isolation (no global random state leakage)")

    # Pollute global numpy state
    np.random.seed(999)
    np.random.random(1000)

    # Run with explicit seed — should not be affected by global state
    r1 = run_projection(TEST_PATIENT, n_iterations=500, seed=42)

    # Pollute again differently
    np.random.seed(111)
    np.random.random(5000)

    r2 = run_projection(TEST_PATIENT, n_iterations=500, seed=42)

    for p1, p2 in zip(r1["pathways"], r2["pathways"]):
        if not p1.get("eligible"):
            continue
        assert p1["probability_recurrence_5y"] == p2["probability_recurrence_5y"], (
            f"Global RNG pollution affected results for {p1['pathway']}"
        )

    print("  ✓ Global numpy random state does not affect seeded results")


# ══════════════════════════════════════════════════════════════════════════
#  Runner
# ══════════════════════════════════════════════════════════════════════════

ALL_TESTS = [
    test_reproducibility,
    test_different_seeds,
    test_convergence,
    test_array_validity,
    test_aggregation,
    test_parameter_uncertainty,
    test_mc_proof_metadata,
    test_no_deterministic_shortcuts,
    test_rng_isolation,
]


def run_all():
    print("=" * 70)
    print("  CareCompass Monte Carlo Audit — %d tests" % len(ALL_TESTS))
    print("=" * 70)

    t0 = time.perf_counter()
    passed = 0
    failed = 0
    errors = []

    for test_fn in ALL_TESTS:
        try:
            test_fn()
            passed += 1
        except AssertionError as e:
            failed += 1
            errors.append((test_fn.__name__, str(e)))
            print(f"  ✗ FAILED: {e}")
        except Exception as e:
            failed += 1
            errors.append((test_fn.__name__, f"ERROR: {e}"))
            print(f"  ✗ ERROR: {e}")

    elapsed = time.perf_counter() - t0

    print("\n" + "=" * 70)
    print(f"  Results: {passed} passed, {failed} failed  ({elapsed:.2f}s)")
    print("=" * 70)

    if errors:
        print("\nFailures:")
        for name, msg in errors:
            print(f"  {name}: {msg}")

    return failed == 0


if __name__ == "__main__":
    ok = run_all()
    sys.exit(0 if ok else 1)
