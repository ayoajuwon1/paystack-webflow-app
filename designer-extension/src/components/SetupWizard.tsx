import { useState } from "react";
import type { AppMode } from "../types/config";
import { PublicKeySetup } from "./PublicKeySetup";
import { BackendSetup } from "./BackendSetup";

interface SetupWizardProps {
  onComplete: (mode: AppMode, publicKey: string, backendUrl: string) => void;
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [selectedMode, setSelectedMode] = useState<AppMode>("client");
  const [step, setStep] = useState<"mode" | "config">("mode");

  if (step === "config") {
    if (selectedMode === "client") {
      return (
        <div className="setup-wizard">
          <div className="setup-header">
            <button className="back-btn" onClick={() => setStep("mode")}>
              &larr; Back
            </button>
            <h2>Enter Your Paystack Key</h2>
          </div>
          <PublicKeySetup
            onComplete={(key) => onComplete("client", key, "")}
          />
        </div>
      );
    }

    return (
      <div className="setup-wizard">
        <div className="setup-header">
          <button className="back-btn" onClick={() => setStep("mode")}>
            &larr; Back
          </button>
          <h2>Connect Your Backend</h2>
        </div>
        <BackendSetup
          onComplete={(url) => onComplete("server", "", url)}
        />
      </div>
    );
  }

  return (
    <div className="setup-wizard">
      <div className="setup-brand">
        <div className="setup-logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#0BA4DB" />
            <path
              d="M8 12h16v2H8v-2zm0 4h12v2H8v-2zm0 4h16v2H8v-2z"
              fill="white"
            />
          </svg>
        </div>
        <h1>Paystack Payments</h1>
        <p className="setup-subtitle">
          Accept payments on your Webflow site with Paystack
        </p>
      </div>

      <div className="setup-modes">
        <button
          className={`mode-card ${selectedMode === "client" ? "mode-card-active" : ""}`}
          onClick={() => setSelectedMode("client")}
        >
          <div className="mode-card-header">
            <div className="mode-radio">
              {selectedMode === "client" && <div className="mode-radio-dot" />}
            </div>
            <span className="mode-card-title">Client-Side</span>
            <span className="mode-card-badge">Recommended</span>
          </div>
          <p className="mode-card-desc">
            Enter your Paystack public key. No backend needed. No data shared
            with third parties.
          </p>
        </button>

        <button
          className={`mode-card ${selectedMode === "server" ? "mode-card-active" : ""}`}
          onClick={() => setSelectedMode("server")}
        >
          <div className="mode-card-header">
            <div className="mode-radio">
              {selectedMode === "server" && <div className="mode-radio-dot" />}
            </div>
            <span className="mode-card-title">Self-Hosted Backend</span>
          </div>
          <p className="mode-card-desc">
            Deploy your own backend for server-side verification, webhooks, and
            transaction history. Open source on GitHub.
          </p>
        </button>
      </div>

      <button
        className="btn-primary btn-md btn-full"
        onClick={() => setStep("config")}
      >
        Continue
      </button>
    </div>
  );
}
