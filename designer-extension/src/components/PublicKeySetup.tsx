import { useState } from "react";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { isValidPublicKey, isTestKey } from "../utils/validators";

interface PublicKeySetupProps {
  onComplete: (publicKey: string) => void;
  initialKey?: string;
}

export function PublicKeySetup({ onComplete, initialKey = "" }: PublicKeySetupProps) {
  const [key, setKey] = useState(initialKey);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const trimmed = key.trim();
    if (!trimmed) {
      setError("Public key is required");
      return;
    }
    if (!isValidPublicKey(trimmed)) {
      setError("Invalid key format. Must start with pk_test_ or pk_live_");
      return;
    }
    setError("");
    onComplete(trimmed);
  };

  const testMode = key.trim() ? isTestKey(key.trim()) : null;

  return (
    <div className="setup-section">
      <Input
        label="Paystack Public Key"
        placeholder="pk_live_xxxxxxxxxxxxxxxxxxxxxxxx"
        value={key}
        onChange={(e) => {
          setKey(e.target.value);
          setError("");
        }}
        error={error}
        hint="Find this in your Paystack Dashboard → Settings → API Keys & Webhooks"
      />

      {testMode !== null && (
        <div className={`mode-badge ${testMode ? "mode-test" : "mode-live"}`}>
          {testMode ? "Test Mode" : "Live Mode"}
        </div>
      )}

      <Button onClick={handleSubmit} fullWidth disabled={!key.trim()}>
        Continue
      </Button>
    </div>
  );
}
