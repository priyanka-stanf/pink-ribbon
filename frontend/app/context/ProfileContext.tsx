"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import type { PatientProfile, HospitalSimulationResult } from "../lib/api";

const PROFILE_KEY = "carecompass_profile";
const RESULTS_KEY = "carecompass_results";

interface ProfileContextValue {
  profile: PatientProfile | null;
  setProfile: (p: PatientProfile | null) => void;
  results: HospitalSimulationResult[] | null;
  setResults: (r: HospitalSimulationResult[] | null) => void;
  loadProfile: () => PatientProfile | null;
  loadResults: () => HospitalSimulationResult[] | null;
}

const Ctx = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, _setProfile] = useState<PatientProfile | null>(null);
  const [results, _setResults] = useState<HospitalSimulationResult[] | null>(null);

  const setProfile = useCallback((p: PatientProfile | null) => {
    _setProfile(p);
    if (typeof window !== "undefined") {
      if (p) sessionStorage.setItem(PROFILE_KEY, JSON.stringify(p));
      else sessionStorage.removeItem(PROFILE_KEY);
    }
  }, []);

  const setResults = useCallback((r: HospitalSimulationResult[] | null) => {
    _setResults(r);
    if (typeof window !== "undefined") {
      if (r) sessionStorage.setItem(RESULTS_KEY, JSON.stringify(r));
      else sessionStorage.removeItem(RESULTS_KEY);
    }
  }, []);

  const loadProfile = useCallback((): PatientProfile | null => {
    if (typeof window === "undefined") return null;
    try {
      const s = sessionStorage.getItem(PROFILE_KEY);
      if (!s) return null;
      const p = JSON.parse(s) as PatientProfile;
      _setProfile(p);
      return p;
    } catch {
      return null;
    }
  }, []);

  const loadResults = useCallback((): HospitalSimulationResult[] | null => {
    if (typeof window === "undefined") return null;
    try {
      const s = sessionStorage.getItem(RESULTS_KEY);
      if (!s) return null;
      const r = JSON.parse(s) as HospitalSimulationResult[];
      _setResults(r);
      return r;
    } catch {
      return null;
    }
  }, []);

  return (
    <Ctx.Provider
      value={{ profile, setProfile, results, setResults, loadProfile, loadResults }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProfile must be within ProfileProvider");
  return ctx;
}
