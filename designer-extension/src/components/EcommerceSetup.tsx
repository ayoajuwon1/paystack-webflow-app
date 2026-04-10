import { useState } from "react";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import type { PaymentButtonConfig, PaystackChannel } from "../types/paystack";
import { CURRENCIES, ALL_CHANNELS } from "../types/paystack";
import { CURRENCY_SYMBOLS } from "../utils/validators";

interface EcommerceSetupProps {
  config: PaymentButtonConfig;
  onUpdateField: <K extends keyof PaymentButtonConfig>(
    field: K,
    value: PaymentButtonConfig[K]
  ) => void;
  onToggleChannel: (channel: PaystackChannel) => void;
  onUpdateCurrency: (currency: PaymentButtonConfig["currency"]) => void;
}

export function EcommerceSetup({
  config,
  onUpdateField,
  onToggleChannel,
  onUpdateCurrency,
}: EcommerceSetupProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const symbol = CURRENCY_SYMBOLS[config.currency] || config.currency;

  return (
    <div className="payment-fields">
      <div className="info-box" style={{ background: "#f0f9ff", borderColor: "#bae6fd" }}>
        <strong>E-commerce mode</strong> adds a shopping cart to your Webflow site.
        Customers can browse products, select variants, adjust quantities, and
        check out with Paystack — all without leaving your site.
      </div>

      <div className="cms-setup-guide">
        <p className="guide-title">How to set up your product cards:</p>

        <div className="guide-step">
          <div className="guide-step-number">1</div>
          <div className="guide-step-content">
            <p className="guide-step-label">Mark each product card</p>
            <p className="guide-step-desc">
              Add a custom attribute to the wrapper element of each product:
            </p>
            <div className="guide-attribute">
              <code>data-paystack-product-id</code> = <code>your-product-slug</code>
            </div>
          </div>
        </div>

        <div className="guide-step">
          <div className="guide-step-number">2</div>
          <div className="guide-step-content">
            <p className="guide-step-label">Mark the product name and price</p>
            <p className="guide-step-desc">Add these attributes to the relevant elements:</p>
            <div className="guide-attribute">
              <code>data-paystack-product</code> <span style={{ color: "#6b7280" }}>on the name</span>
            </div>
            <div className="guide-attribute" style={{ marginTop: 4 }}>
              <code>data-paystack-price</code> <span style={{ color: "#6b7280" }}>on the price</span>
            </div>
          </div>
        </div>

        <div className="guide-step">
          <div className="guide-step-number">3</div>
          <div className="guide-step-content">
            <p className="guide-step-label">Add buttons</p>
            <p className="guide-step-desc">
              Use these attributes on your buttons:
            </p>
            <div className="guide-attribute">
              <code>data-paystack-button</code> = <code>cart</code>
              <span style={{ color: "#6b7280", marginLeft: 8 }}>Add to Cart</span>
            </div>
            <div className="guide-attribute" style={{ marginTop: 4 }}>
              <code>data-paystack-button</code> = <code>buy</code>
              <span style={{ color: "#6b7280", marginLeft: 8 }}>Buy Now (skip cart)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="info-box">
        <strong>Optional features</strong> — add these attributes for more functionality:
        <ul style={{ marginTop: 6, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
          <li><code>data-paystack-variant="Size"</code> on a <code>&lt;select&gt;</code> for variant selection</li>
          <li><code>data-price-adjust="2000"</code> on <code>&lt;option&gt;</code> tags for variant price changes</li>
          <li><code>data-paystack-qty</code> on a number <code>&lt;input&gt;</code> for quantity selection</li>
          <li><code>data-paystack-product-image</code> on an <code>&lt;img&gt;</code> for cart thumbnails</li>
          <li><code>data-paystack-cart-trigger</code> on any element to open the cart</li>
        </ul>
      </div>

      <pre className="code-block">{`<!-- Example product card -->
<div data-paystack-product-id="widget-pro">
  <img src="..." data-paystack-product-image />
  <h3 data-paystack-product>Widget Pro</h3>
  <p data-paystack-price>${symbol} 5,000</p>

  <!-- Optional: variant -->
  <select data-paystack-variant="Size">
    <option>Small</option>
    <option data-price-adjust="2000">Large (+${symbol}2,000)</option>
  </select>

  <!-- Optional: quantity -->
  <input type="number" data-paystack-qty value="1" min="1" />

  <button data-paystack-button="cart">Add to Cart</button>
  <button data-paystack-button="buy">Buy Now</button>
</div>`}</pre>

      <button
        className="btn-ghost advanced-toggle"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        {showAdvanced ? "← Hide settings" : "Cart settings →"}
      </button>

      {showAdvanced && (
        <>
          <Select
            label="Currency"
            value={config.currency}
            onChange={(e) =>
              onUpdateCurrency(e.target.value as PaymentButtonConfig["currency"])
            }
            options={CURRENCIES}
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

          <div className="input-group">
            <label className="input-label">Email Collection</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="ecom-email"
                  checked={config.emailCollection === "prompt"}
                  onChange={() => onUpdateField("emailCollection", "prompt")}
                />
                <span>Prompt at checkout</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="ecom-email"
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
                placeholder="#email-input"
              />
            )}
          </div>

          <Input
            label="Success URL"
            value={config.successUrl}
            onChange={(e) => onUpdateField("successUrl", e.target.value)}
            placeholder="/order-confirmed"
            hint="Redirect here after successful checkout"
          />
        </>
      )}
    </div>
  );
}
