import { useState, useCallback } from "react";
import type { AppMode, AppState } from "../types/config";
import { DEFAULT_APP_STATE } from "../types/config";

const STORAGE_KEY = "paystack-webflow-state";

function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore parse errors
  }
  return DEFAULT_APP_STATE;
}

function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useMode() {
  const [state, setState] = useState<AppState>(loadState);

  const setMode = useCallback((mode: AppMode) => {
    setState((prev) => {
      const next = { ...prev, mode };
      saveState(next);
      return next;
    });
  }, []);

  const setPublicKey = useCallback((publicKey: string) => {
    setState((prev) => {
      const next = { ...prev, publicKey };
      saveState(next);
      return next;
    });
  }, []);

  const setBackendUrl = useCallback((backendUrl: string) => {
    setState((prev) => {
      const next = { ...prev, backendUrl };
      saveState(next);
      return next;
    });
  }, []);

  const completeSetup = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, isSetupComplete: true };
      saveState(next);
      return next;
    });
  }, []);

  const resetSetup = useCallback(() => {
    const next = DEFAULT_APP_STATE;
    saveState(next);
    setState(next);
  }, []);

  return {
    state,
    setMode,
    setPublicKey,
    setBackendUrl,
    completeSetup,
    resetSetup,
  };
}
