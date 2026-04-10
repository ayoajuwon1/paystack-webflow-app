import { Input } from "./ui/Input";
import type { PaymentButtonConfig } from "../types/paystack";
import type { AppMode } from "../types/config";

interface SubscriptionSetupProps {
  config: PaymentButtonConfig;
  mode: AppMode;
  onUpdateField: <K extends keyof PaymentButtonConfig>(
    field: K,
    value: PaymentButtonConfig[K]
  ) => void;
}

export function SubscriptionSetup({
  config,
  mode,
  onUpdateField,
}: SubscriptionSetupProps) {
  return (
    <div className="payment-fields">
      <div className="info-box">
        {mode === "client" ? (
          <>
            <p>
              Create subscription plans in your{" "}
              <a
                href="https://dashboard.paystack.com/#/plans"
                target="_blank"
                rel="noopener noreferrer"
              >
                Paystack Dashboard
              </a>
              , then paste the plan code below.
            </p>
          </>
        ) : (
          <p>
            In self-hosted mode, you can also create plans directly from
            this panel. This feature is coming soon.
          </p>
        )}
      </div>

      <Input
        label="Plan Code"
        value={config.planCode}
        onChange={(e) => onUpdateField("planCode", e.target.value)}
        placeholder="PLN_xxxxxxxxxxxxxxx"
        hint="The plan code from your Paystack Dashboard"
      />

      <Input
        label="Button Label"
        value={config.label}
        onChange={(e) => onUpdateField("label", e.target.value)}
        placeholder="Subscribe"
      />

      <Input
        label="Success URL"
        value={config.successUrl}
        onChange={(e) => onUpdateField("successUrl", e.target.value)}
        placeholder="/welcome"
        hint="Redirect here after successful subscription"
      />
    </div>
  );
}
