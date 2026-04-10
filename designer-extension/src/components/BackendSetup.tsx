import { useState } from "react";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";

interface BackendSetupProps {
  onComplete: (backendUrl: string) => void;
  initialUrl?: string;
}

export function BackendSetup({ onComplete, initialUrl = "" }: BackendSetupProps) {
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState("");
  const [testing, setTesting] = useState(false);
  const [connected, setConnected] = useState(false);

  const testConnection = async () => {
    const trimmed = url.trim().replace(/\/$/, "");
    if (!trimmed) {
      setError("Backend URL is required");
      return;
    }

    try {
      new URL(trimmed);
    } catch {
      setError("Invalid URL format");
      return;
    }

    setTesting(true);
    setError("");

    try {
      const res = await fetch(`${trimmed}/api/auth`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setConnected(true);
      } else {
        setError(`Backend responded with status ${res.status}`);
      }
    } catch {
      setError("Could not connect. Make sure the backend is running.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="setup-section">
      <div className="setup-info">
        <p>
          Self-hosted mode requires deploying the open-source backend to your own
          Vercel account. Your Paystack secret key stays on your server.
        </p>
        <a
          href="https://github.com/AyoAkin/paystack-webflow-app#mode-2-self-hosted-backend"
          target="_blank"
          rel="noopener noreferrer"
          className="setup-link"
        >
          View setup guide on GitHub
        </a>
      </div>

      <Input
        label="Backend URL"
        placeholder="https://your-app.vercel.app"
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          setError("");
          setConnected(false);
        }}
        error={error}
        hint="The URL where you deployed the Paystack Webflow backend"
      />

      {connected && (
        <div className="mode-badge mode-live">Connected</div>
      )}

      <div className="button-row">
        <Button
          variant="secondary"
          onClick={testConnection}
          disabled={!url.trim() || testing}
        >
          {testing ? "Testing..." : "Test Connection"}
        </Button>
        <Button onClick={() => onComplete(url.trim().replace(/\/$/, ""))} disabled={!connected}>
          Continue
        </Button>
      </div>
    </div>
  );
}
