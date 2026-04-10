import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import type { PaymentButtonConfig, DynamicSourceConfig } from "../types/paystack";

interface DynamicPricingSetupProps {
  config: PaymentButtonConfig;
  onUpdateField: <K extends keyof PaymentButtonConfig>(
    field: K,
    value: PaymentButtonConfig[K]
  ) => void;
}

const AMOUNT_ATTR_OPTIONS = [
  { value: "textContent", label: "Text content (visible text)" },
  { value: "data-amount", label: "data-amount attribute" },
  { value: "data-price", label: "data-price attribute" },
  { value: "data-paystack-price", label: "data-paystack-price attribute" },
];

export function DynamicPricingSetup({
  config,
  onUpdateField,
}: DynamicPricingSetupProps) {
  const ds = config.dynamicSource;

  const updateDynamic = (field: keyof DynamicSourceConfig, value: string | boolean) => {
    onUpdateField("dynamicSource", { ...ds, [field]: value });
  };

  return (
    <div className="dynamic-pricing-fields">
      <div className="info-box">
        <p>
          <strong>How CMS dynamic pricing works:</strong> Instead of hardcoding
          an amount, the checkout script reads the price from an element near the
          pay button. This works with Webflow CMS Collection Lists — each item
          gets its own price automatically.
        </p>
      </div>

      <div className="cms-example">
        <p className="input-label">Example CMS structure</p>
        <pre className="code-block">{`<!-- Your CMS Collection Item -->
<div class="product-card">
  <h3 data-paystack-product>Product Name</h3>
  <p data-paystack-price>5,000</p>
  <button data-paystack-button>Buy Now</button>
</div>`}</pre>
      </div>

      <Input
        label="Price element selector"
        value={ds.amountSelector}
        onChange={(e) => updateDynamic("amountSelector", e.target.value)}
        placeholder="[data-paystack-price] or .price"
        hint="CSS selector for the element containing the price. The script looks for this near each pay button."
      />

      <Select
        label="Read amount from"
        value={ds.amountAttribute}
        onChange={(e) => updateDynamic("amountAttribute", e.target.value)}
        options={AMOUNT_ATTR_OPTIONS}
        hint="Where on the element is the price value?"
      />

      <div className="input-group">
        <label className="input-label">Amount format</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="amount-format"
              checked={!ds.amountInSmallestUnit}
              onChange={() => updateDynamic("amountInSmallestUnit", false)}
            />
            <span>Major unit (e.g. <strong>5000</strong> = NGN 5,000)</span>
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="amount-format"
              checked={ds.amountInSmallestUnit}
              onChange={() => updateDynamic("amountInSmallestUnit", true)}
            />
            <span>Smallest unit (e.g. <strong>500000</strong> = NGN 5,000)</span>
          </label>
        </div>
        <span className="input-hint">
          If your CMS shows "5,000" or "5000" for five thousand naira, choose major unit.
          The script will auto-convert to kobo.
        </span>
      </div>

      <Input
        label="Product name selector (optional)"
        value={ds.productNameSelector}
        onChange={(e) => updateDynamic("productNameSelector", e.target.value)}
        placeholder="[data-paystack-product] or .product-name"
        hint="Reads the product name and sends it to Paystack as metadata"
      />

      <Input
        label="Currency selector (optional)"
        value={ds.currencySelector}
        onChange={(e) => updateDynamic("currencySelector", e.target.value)}
        placeholder="Leave empty to use default currency"
        hint="If each CMS item has its own currency, point to the element containing it"
      />
    </div>
  );
}
