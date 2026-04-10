import { useState } from "react";
import { Input } from "./ui/Input";
import type { PaymentButtonConfig, DynamicSourceConfig } from "../types/paystack";

interface DynamicPricingSetupProps {
  config: PaymentButtonConfig;
  onUpdateField: <K extends keyof PaymentButtonConfig>(
    field: K,
    value: PaymentButtonConfig[K]
  ) => void;
}

type SetupMode = "guided" | "advanced";

export function DynamicPricingSetup({
  config,
  onUpdateField,
}: DynamicPricingSetupProps) {
  const [mode, setMode] = useState<SetupMode>("guided");
  const ds = config.dynamicSource;

  const updateDynamic = (field: keyof DynamicSourceConfig, value: string | boolean) => {
    onUpdateField("dynamicSource", { ...ds, [field]: value });
  };

  return (
    <div className="dynamic-pricing-fields">
      <div className="info-box">
        <strong>How it works:</strong> Add a custom attribute to the element showing each product's price.
        The checkout script automatically reads the price from that element.
      </div>

      {mode === "guided" ? (
        <>
          <div className="cms-setup-guide">
            <p className="guide-title">Setup in 2 steps:</p>

            <div className="guide-step">
              <div className="guide-step-number">1</div>
              <div className="guide-step-content">
                <p className="guide-step-label">Add attribute to your price element</p>
                <p className="guide-step-desc">
                  Select the text element showing the price in your Webflow Collection List.
                  Go to Element Settings → Custom Attributes → add:
                </p>
                <div className="guide-attribute">
                  <code>data-paystack-price</code> = <code>(leave value empty)</code>
                </div>
              </div>
            </div>

            <div className="guide-step">
              <div className="guide-step-number">2</div>
              <div className="guide-step-content">
                <p className="guide-step-label">Add attribute to your product name (optional)</p>
                <p className="guide-step-desc">
                  Same process on the product title element:
                </p>
                <div className="guide-attribute">
                  <code>data-paystack-product</code> = <code>(leave value empty)</code>
                </div>
              </div>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Price format in your CMS</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="price-format"
                  checked={!ds.amountInSmallestUnit}
                  onChange={() => updateDynamic("amountInSmallestUnit", false)}
                />
                <span>Regular amount (e.g. <strong>5,000</strong> or <strong>5000</strong>)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="price-format"
                  checked={ds.amountInSmallestUnit}
                  onChange={() => updateDynamic("amountInSmallestUnit", true)}
                />
                <span>Already in kobo (e.g. <strong>500000</strong>)</span>
              </label>
            </div>
            <span className="input-hint">
              Most CMS setups show the regular amount. If your price field shows "5,000" for five thousand naira, choose the first option.
            </span>
          </div>

          <button
            className="btn-ghost advanced-toggle"
            onClick={() => setMode("advanced")}
          >
            Advanced: custom selectors →
          </button>
        </>
      ) : (
        <>
          <button
            className="btn-ghost advanced-toggle"
            onClick={() => setMode("guided")}
          >
            ← Back to guided setup
          </button>

          <Input
            label="Price element selector"
            value={ds.amountSelector}
            onChange={(e) => updateDynamic("amountSelector", e.target.value)}
            placeholder="[data-paystack-price]"
            hint="CSS selector for the price element near each pay button"
          />

          <div className="input-group">
            <label className="input-label">Read amount from</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="amount-source"
                  checked={ds.amountAttribute === "textContent"}
                  onChange={() => updateDynamic("amountAttribute", "textContent")}
                />
                <span>Visible text (e.g. "NGN 5,000")</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="amount-source"
                  checked={ds.amountAttribute !== "textContent"}
                  onChange={() => updateDynamic("amountAttribute", "data-amount")}
                />
                <span>Data attribute</span>
              </label>
            </div>
            {ds.amountAttribute !== "textContent" && (
              <Input
                label="Attribute name"
                value={ds.amountAttribute}
                onChange={(e) => updateDynamic("amountAttribute", e.target.value)}
                placeholder="data-amount"
              />
            )}
          </div>

          <div className="input-group">
            <label className="input-label">Price format</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="price-format-adv"
                  checked={!ds.amountInSmallestUnit}
                  onChange={() => updateDynamic("amountInSmallestUnit", false)}
                />
                <span>Regular amount (auto-converts to kobo)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="price-format-adv"
                  checked={ds.amountInSmallestUnit}
                  onChange={() => updateDynamic("amountInSmallestUnit", true)}
                />
                <span>Already in smallest unit (kobo)</span>
              </label>
            </div>
          </div>

          <Input
            label="Product name selector"
            value={ds.productNameSelector}
            onChange={(e) => updateDynamic("productNameSelector", e.target.value)}
            placeholder="[data-paystack-product]"
            hint="Optional: reads product name for Paystack metadata"
          />

          <Input
            label="Currency selector"
            value={ds.currencySelector}
            onChange={(e) => updateDynamic("currencySelector", e.target.value)}
            placeholder="Leave empty to use default"
            hint="Only needed if each item has a different currency"
          />
        </>
      )}
    </div>
  );
}
