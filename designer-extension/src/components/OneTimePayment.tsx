import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { DynamicPricingSetup } from "./DynamicPricingSetup";
import type { PaymentButtonConfig, PaystackChannel, AmountMode } from "../types/paystack";
import { CURRENCIES, ALL_CHANNELS } from "../types/paystack";
import { formatAmountForDisplay, CURRENCY_SYMBOLS } from "../utils/validators";

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
  const symbol = CURRENCY_SYMBOLS[config.currency] || config.currency;
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

      <div className="input-group">
        <label className="input-label">Pricing Mode</label>
        <div className="pricing-toggle">
          <button
            className={`pricing-toggle-btn ${config.amountMode === "fixed" ? "pricing-toggle-active" : ""}`}
            onClick={() => onUpdateField("amountMode", "fixed" as AmountMode)}
          >
            Fixed Amount
          </button>
          <button
            className={`pricing-toggle-btn ${config.amountMode === "dynamic" ? "pricing-toggle-active" : ""}`}
            onClick={() => onUpdateField("amountMode", "dynamic" as AmountMode)}
          >
            Dynamic (CMS)
          </button>
        </div>
        <span className="input-hint">
          {config.amountMode === "fixed"
            ? "Set a specific amount for this button"
            : "Read the price from a nearby element on the page (works with CMS Collection Lists)"}
        </span>
      </div>

      {config.amountMode === "fixed" ? (
        <div className="field-row">
          <div className="input-group">
            <label className="input-label" htmlFor="amount">Amount ({symbol})</label>
            <div className="amount-input-wrap">
              <span className="amount-prefix">{symbol}</span>
              <input
                id="amount"
                className="input-field amount-input"
                type="number"
                value={config.amount || ""}
                onChange={(e) =>
                  onUpdateField("amount", parseFloat(e.target.value) || 0)
                }
                placeholder="5,000"
                min="0"
                step="any"
              />
            </div>
            {displayAmount && (
              <span className="input-hint amount-preview">{displayAmount}</span>
            )}
          </div>
          <Select
            label="Currency"
            value={config.currency}
            onChange={(e) =>
              onUpdateCurrency(e.target.value as PaymentButtonConfig["currency"])
            }
            options={CURRENCIES}
          />
        </div>
      ) : (
        <>
          <Select
            label="Default Currency"
            value={config.currency}
            onChange={(e) =>
              onUpdateCurrency(e.target.value as PaymentButtonConfig["currency"])
            }
            options={CURRENCIES}
            hint="Used when no currency is specified per item"
          />
          <DynamicPricingSetup config={config} onUpdateField={onUpdateField} />
        </>
      )}

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
