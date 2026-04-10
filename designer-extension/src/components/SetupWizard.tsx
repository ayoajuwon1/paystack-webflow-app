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
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <rect width="56" height="56" rx="16" fill="#0BA4DB" />
            <rect x="2" y="2" width="52" height="52" rx="14" fill="#0BA4DB" />
            <path d="M16 22h24v3H16v-3z" fill="white" opacity="0.9" />
            <path d="M16 28h18v3H16v-3z" fill="white" opacity="0.7" />
            <path d="M16 34h24v3H16v-3z" fill="white" opacity="0.9" />
          </svg>
        </div>
        <h1>Paystack Payments</h1>
        <p className="setup-subtitle">
          Accept payments on your Webflow site — cards, transfers, USSD, and more
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
