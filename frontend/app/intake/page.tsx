"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { analyze, type PatientProfile } from "../lib/api";
import { useProfile } from "../context/ProfileContext";

// ── Defaults & builders ──────────────────────────────────────────────────

function defaultProfile(): PatientProfile {
  return {
    age: 55,
    zip_code: "",
    stage: "Unknown",
    er_status: null,
    pr_status: null,
    her2_status: null,
    node_status: null,
    comorbidities: [],
    current_symptoms: [],
    fertility_concern: false,
  };
}

const STAGE_OPTIONS = [
  { value: "Unknown", label: "Unknown / not yet staged" },
  { value: "I", label: "Stage I" },
  { value: "II", label: "Stage II" },
  { value: "III", label: "Stage III" },
  { value: "IV", label: "Stage IV" },
];

// ── Page ─────────────────────────────────────────────────────────────────

export default function IntakePage() {
  const router = useRouter();
  const { setProfile, setResults } = useProfile();

  const [step, setStep] = useState(1); // 1=diagnosis, 2=health, 3=location+submit
  const [form, setForm] = useState<PatientProfile>(defaultProfile());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const patch = (partial: Partial<PatientProfile>) =>
    setForm((prev) => ({ ...prev, ...partial }));

  const handleSubmit = useCallback(async () => {
    setError(null);
    if (!form.zip_code.trim()) {
      setError("ZIP code is required.");
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);

    try {
      const res = await analyze(form, { signal: controller.signal });
      setProfile(form);
      setResults(res.results);
      router.push("/results");
    } catch (e) {
      if ((e as Error).name === "AbortError") {
        setError("Request cancelled.");
      } else {
        setError((e as Error).message || "Analysis failed.");
      }
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setLoading(false);
      setElapsed(0);
      abortRef.current = null;
    }
  }, [form, router, setProfile, setResults]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 p-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Patient intake</h1>
        <p className="text-sm text-stone-500 mb-6">
          Step {step} of 3:{" "}
          {step === 1 ? "Diagnosis" : step === 2 ? "Health background" : "Location & submit"}
        </p>

        {step === 1 && (
          <DiagnosisStep form={form} patch={patch} onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <HealthStep form={form} patch={patch} onNext={() => setStep(3)} onBack={() => setStep(1)} />
        )}
        {step === 3 && (
          <LocationStep
            form={form}
            patch={patch}
            onSubmit={handleSubmit}
            onBack={() => setStep(2)}
            loading={loading}
            elapsed={elapsed}
            onCancel={() => abortRef.current?.abort()}
            error={error}
          />
        )}
      </div>
    </div>
  );
}

// ── Step 1: Diagnosis ────────────────────────────────────────────────────

function DiagnosisStep({
  form,
  patch,
  onNext,
}: {
  form: PatientProfile;
  patch: (p: Partial<PatientProfile>) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4">
      <Field label="Age at diagnosis *">
        <input
          type="number"
          min={18}
          max={100}
          value={form.age}
          onChange={(e) => patch({ age: Number(e.target.value) || 55 })}
          className="input"
        />
      </Field>

      <Field label="Stage at diagnosis">
        <select
          value={form.stage}
          onChange={(e) => patch({ stage: e.target.value })}
          className="input"
        >
          {STAGE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <div>
        <span className="label">Receptor status (if known)</span>
        <div className="flex flex-wrap gap-4 mt-1">
          {(
            [
              ["er_status", "ER"],
              ["pr_status", "PR"],
              ["her2_status", "HER2"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2">
              <span className="text-sm">{label}</span>
              <select
                value={form[key] === null ? "" : form[key] ? "yes" : "no"}
                onChange={(e) =>
                  patch({ [key]: e.target.value === "" ? null : e.target.value === "yes" })
                }
                className="border border-stone-300 rounded p-1 text-sm"
              >
                <option value="">Unknown</option>
                <option value="yes">Positive</option>
                <option value="no">Negative</option>
              </select>
            </label>
          ))}
        </div>
      </div>

      <Field label="Lymph node involvement">
        <select
          value={form.node_status === null ? "" : form.node_status ? "yes" : "no"}
          onChange={(e) =>
            patch({ node_status: e.target.value === "" ? null : e.target.value === "yes" })
          }
          className="input"
        >
          <option value="">Unknown</option>
          <option value="yes">Positive</option>
          <option value="no">Negative</option>
        </select>
      </Field>

      <button onClick={onNext} className="btn-primary">
        Next
      </button>
    </div>
  );
}

// ── Step 2: Health background ────────────────────────────────────────────

function HealthStep({
  form,
  patch,
  onNext,
  onBack,
}: {
  form: PatientProfile;
  patch: (p: Partial<PatientProfile>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const toggleComorbidity = (key: string, checked: boolean) => {
    const next = checked
      ? [...new Set([...form.comorbidities, key])]
      : form.comorbidities.filter((c) => c !== key);
    patch({ comorbidities: next });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-600">Select any major conditions (optional).</p>
      {["diabetes", "cardiovascular_disease"].map((c) => (
        <label key={c} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.comorbidities.includes(c)}
            onChange={(e) => toggleComorbidity(c, e.target.checked)}
          />
          <span className="text-sm capitalize">{c.replace("_", " ")}</span>
        </label>
      ))}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.fertility_concern}
          onChange={(e) => patch({ fertility_concern: e.target.checked })}
        />
        <span className="text-sm">Fertility preservation concern</span>
      </label>
      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="btn-secondary">
          Back
        </button>
        <button onClick={onNext} className="btn-primary">
          Next
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Location + submit ────────────────────────────────────────────

function LocationStep({
  form,
  patch,
  onSubmit,
  onBack,
  loading,
  elapsed,
  onCancel,
  error,
}: {
  form: PatientProfile;
  patch: (p: Partial<PatientProfile>) => void;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
  elapsed: number;
  onCancel: () => void;
  error: string | null;
}) {
  return (
    <div className="space-y-4">
      <Field label="ZIP code *">
        <input
          type="text"
          value={form.zip_code}
          onChange={(e) => patch({ zip_code: e.target.value })}
          placeholder="e.g. 94102"
          maxLength={10}
          className="input"
        />
      </Field>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-1">
          <p className="text-stone-600 text-sm font-medium">
            Finding hospitals &amp; running simulation… {elapsed}s
          </p>
          <button onClick={onCancel} className="text-red-600 text-sm underline">
            Cancel
          </button>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} disabled={loading} className="btn-secondary">
          Back
        </button>
        <button onClick={onSubmit} disabled={loading} className="btn-primary disabled:opacity-60">
          {loading ? "Running…" : "Analyze"}
        </button>
      </div>
    </div>
  );
}

// ── Shared UI ────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
