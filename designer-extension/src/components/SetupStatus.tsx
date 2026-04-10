import { Button } from "./ui/Button";

interface SetupStatusProps {
  steps: Array<{
    label: string;
    done: boolean;
  }>;
  isTestMode: boolean;
  onDismiss: () => void;
  onPreview: () => void;
}

export function SetupStatus({ steps, isTestMode, onDismiss, onPreview }: SetupStatusProps) {
  const allDone = steps.every((s) => s.done);

  return (
    <div className="setup-status">
      <div className="status-header">
        <div className={`status-icon ${allDone ? "status-icon-success" : "status-icon-progress"}`}>
          {allDone ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="currentColor" opacity="0.15" />
              <path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3" />
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </div>
        <h3>{allDone ? "Payment configured!" : "Setting up..."}</h3>
      </div>

      <div className="status-checklist">
        {steps.map((step, i) => (
          <div key={i} className={`status-step ${step.done ? "status-step-done" : ""}`}>
            <span className="status-check">
              {step.done ? "✓" : "○"}
            </span>
            <span>{step.label}</span>
          </div>
        ))}
      </div>

      {isTestMode && (
        <div className="info-box info-warning">
          You're using test keys — payments won't be charged for real.
          Use Paystack's{" "}
          <a
            href="https://paystack.com/docs/payments/test-payments/"
            target="_blank"
            rel="noopener noreferrer"
          >
            test cards
          </a>
          {" "}to try it out.
        </div>
      )}

      {allDone && (
        <div className="status-next">
          <p className="status-next-label">Next steps:</p>
          <ol className="status-next-list">
            <li>Publish your Webflow site</li>
            <li>Visit the live page and test the payment button</li>
            <li>Check your Paystack Dashboard for the transaction</li>
          </ol>
        </div>
      )}

      <div className="status-actions">
        <Button variant="secondary" onClick={onPreview}>
          Preview
        </Button>
        <Button onClick={onDismiss}>
          {allDone ? "Configure Another" : "Back to Config"}
        </Button>
      </div>
    </div>
  );
}
