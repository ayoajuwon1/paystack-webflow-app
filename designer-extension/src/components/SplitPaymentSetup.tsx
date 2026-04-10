import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import type { PaymentButtonConfig, PaystackChannel } from "../types/paystack";
import { CURRENCIES, ALL_CHANNELS } from "../types/paystack";
import { formatAmountForDisplay } from "../utils/validators";
import type { AppMode } from "../types/config";

interface SplitPaymentSetupProps {
  config: PaymentButtonConfig;
  mode: AppMode;
  onUpdateField: <K extends keyof PaymentButtonConfig>(
    field: K,
    value: PaymentButtonConfig[K]
  ) => void;
  onToggleChannel: (channel: PaystackChannel) => void;
  onUpdateCurrency: (currency: PaymentButtonConfig["currency"]) => void;
}

export function SplitPaymentSetup({
  config,
  mode,
  onUpdateField,
  onToggleChannel,
  onUpdateCurrency,
}: SplitPaymentSetupProps) {
  const displayAmount = config.amount
    ? formatAmountForDisplay(config.amount, config.currency)
    : "";

  return (
    <div className="payment-fields">
      <div className="info-box">
        {mode === "client" ? (
          <p>
            Create subaccounts and transaction splits in your{" "}
            <a
              href="https://dashboard.paystack.com/#/split"
              target="_blank"
              rel="noopener noreferrer"
            >
              Paystack Dashboard
            </a>
            , then paste the codes below.
          </p>
        ) : (
          <p>
            In self-hosted mode, you can create subaccounts and splits
            directly. This feature is coming soon.
          </p>
        )}
      </div>

      <Input
        label="Button Label"
        value={config.label}
        onChange={(e) => onUpdateField("label", e.target.value)}
        placeholder="Pay Now"
      />

      <div className="field-row">
        <Input
          label="Amount (smallest unit)"
          type="number"
          value={config.amount || ""}
          onChange={(e) =>
            onUpdateField("amount", parseInt(e.target.value, 10) || 0)
          }
          placeholder="500000"
          hint={displayAmount ? `= ${displayAmount}` : "e.g. 500000 kobo = NGN 5,000"}
        />
        <Select
          label="Currency"
          value={config.currency}
          onChange={(e) =>
            onUpdateCurrency(e.target.value as PaymentButtonConfig["currency"])
          }
          options={CURRENCIES}
        />
      </div>

      <Input
        label="Subaccount Code"
        value={config.subaccountCode}
        onChange={(e) => onUpdateField("subaccountCode", e.target.value)}
        placeholder="ACCT_xxxxxxxxxxxxxxx"
        hint="For single-split payments to one subaccount"
      />

      <Input
        label="Split Code"
        value={config.splitCode}
        onChange={(e) => onUpdateField("splitCode", e.target.value)}
        placeholder="SPL_xxxxxxxxxxxxxxx"
        hint="For multi-split payments across multiple subaccounts"
      />

      <div className="input-group">
        <label className="input-label">Payment Channels</label>
        <div className="channel-grid">
          {ALL_CHANNELS.map((ch) => (
            <label key={ch.value} className="channel-option">
              <input
                type="checkbox"
                checked={config.channels.includes(ch.value)}
                onChange={() => onToggleChannel(ch.value)}
              />
              <span>{ch.label}</span>
            </label>
          ))}
        </div>
      </div>

      <Input
        label="Success URL"
        value={config.successUrl}
        onChange={(e) => onUpdateField("successUrl", e.target.value)}
        placeholder="/thank-you"
        hint="Redirect here after successful payment"
      />
    </div>
  );
}
