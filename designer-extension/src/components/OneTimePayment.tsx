import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import type { PaymentButtonConfig, PaystackChannel } from "../types/paystack";
import { CURRENCIES, ALL_CHANNELS } from "../types/paystack";
import { formatAmountForDisplay } from "../utils/validators";

interface OneTimePaymentProps {
  config: PaymentButtonConfig;
  onUpdateField: <K extends keyof PaymentButtonConfig>(
    field: K,
    value: PaymentButtonConfig[K]
  ) => void;
  onToggleChannel: (channel: PaystackChannel) => void;
  onUpdateCurrency: (currency: PaymentButtonConfig["currency"]) => void;
}

export function OneTimePayment({
  config,
  onUpdateField,
  onToggleChannel,
  onUpdateCurrency,
}: OneTimePaymentProps) {
  const displayAmount = config.amount
    ? formatAmountForDisplay(config.amount, config.currency)
    : "";

  return (
    <div className="payment-fields">
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

      <div className="input-group">
        <label className="input-label">Email Collection</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="email-collection"
              checked={config.emailCollection === "prompt"}
              onChange={() => onUpdateField("emailCollection", "prompt")}
            />
            <span>Prompt customer for email</span>
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="email-collection"
              checked={config.emailCollection === "field"}
              onChange={() => onUpdateField("emailCollection", "field")}
            />
            <span>Read from form field</span>
          </label>
        </div>
        {config.emailCollection === "field" && (
          <Input
            label="Email Field Selector"
            value={config.emailFieldSelector}
            onChange={(e) => onUpdateField("emailFieldSelector", e.target.value)}
            placeholder="#email-input or [data-paystack-email]"
            hint="CSS selector for the email input on your page"
          />
        )}
      </div>

      <Input
        label="Success URL"
        value={config.successUrl}
        onChange={(e) => onUpdateField("successUrl", e.target.value)}
        placeholder="/thank-you"
        hint="Redirect here after successful payment (optional)"
      />

      <Input
        label="Cancel URL"
        value={config.cancelUrl}
        onChange={(e) => onUpdateField("cancelUrl", e.target.value)}
        placeholder="/cancelled"
        hint="Redirect here if customer cancels (optional)"
      />
    </div>
  );
}
