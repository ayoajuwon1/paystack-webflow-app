import { useState } from "react";
import { Tabs } from "./ui/Tabs";
import { Button } from "./ui/Button";
import { OneTimePayment } from "./OneTimePayment";
import { SubscriptionSetup } from "./SubscriptionSetup";
import { SplitPaymentSetup } from "./SplitPaymentSetup";
import { PaymentPageLink } from "./PaymentPageLink";
import { SetupStatus } from "./SetupStatus";
import { usePaystackConfig } from "../hooks/usePaystackConfig";
import { useWebflow } from "../hooks/useWebflow";
import { generateClientScript } from "../utils/script-generator";
import type { AppMode } from "../types/config";
import type { PaymentType } from "../types/paystack";
import { isValidAmount, toSmallestUnit, isTestKey } from "../utils/validators";

const PAYMENT_TYPE_TABS = [
  { id: "one_time", label: "One-time" },
  { id: "subscription", label: "Subscription" },
  { id: "split", label: "Split" },
  { id: "payment_page", label: "Page Link" },
];

interface PaymentConfiguratorProps {
  publicKey: string;
  mode: AppMode;
  backendUrl: string;
}

interface ApplyResult {
  scriptCopied: boolean;
  attributesSet: boolean;
  elementName: string;
}

export function PaymentConfigurator({
  publicKey,
  mode,
  backendUrl: _backendUrl,
}: PaymentConfiguratorProps) {
  void _backendUrl;
  const {
    configs,
    currentConfig,
    saveConfig,
    deleteConfig,
    updateField,
    updatePaymentType,
    updateCurrency,
    toggleChannel,
    resetConfig,
    setCurrentConfig,
  } = usePaystackConfig();

  const { selectedElement, notify, isDesignerReady } = useWebflow();
  const [applying, setApplying] = useState(false);
  const [showConfigs, setShowConfigs] = useState(false);
  const [applyResult, setApplyResult] = useState<ApplyResult | null>(null);

  const handleApply = async () => {
    // Validate based on payment type
    if (
      currentConfig.paymentType === "one_time" &&
      currentConfig.amountMode === "fixed" &&
      !isValidAmount(currentConfig.amount)
    ) {
      notify("Please enter a valid amount", "Error");
      return;
    }
    if (
      currentConfig.paymentType === "one_time" &&
      currentConfig.amountMode === "dynamic" &&
      !currentConfig.dynamicSource.amountSelector
    ) {
      notify("Please enter a price element selector", "Error");
      return;
    }
    if (currentConfig.paymentType === "subscription" && !currentConfig.planCode) {
      notify("Please enter a plan code", "Error");
      return;
    }
    if (
      currentConfig.paymentType === "split" &&
      !currentConfig.subaccountCode &&
      !currentConfig.splitCode
    ) {
      notify("Please enter a subaccount code or split code", "Error");
      return;
    }
    if (currentConfig.channels.length === 0) {
      notify("Please select at least one payment channel", "Error");
      return;
    }

    if (!isDesignerReady && !selectedElement) {
      // Not in Designer — check if user wants to proceed with clipboard only
    }

    setApplying(true);
    const result: ApplyResult = {
      scriptCopied: false,
      attributesSet: false,
      elementName: "",
    };

    try {
      // Generate the checkout script
      const script = generateClientScript({
        publicKey,
        config: currentConfig,
      });

      // Save config
      saveConfig(currentConfig);

      // Copy script to clipboard
      try {
        await navigator.clipboard.writeText(script);
        result.scriptCopied = true;
      } catch {
        // Clipboard may not be available in iframe
      }

      // Set data attributes on selected element
      if (isDesignerReady && selectedElement) {
        try {
          const el = await webflow.getSelectedElement();
          if (el) {
            await el.setCustomAttribute("data-paystack-button", "true");

            if (currentConfig.amountMode === "fixed" && currentConfig.amount > 0) {
              await el.setCustomAttribute(
                "data-paystack-amount",
                String(toSmallestUnit(currentConfig.amount))
              );
            }
            await el.setCustomAttribute("data-paystack-currency", currentConfig.currency);

            if (currentConfig.planCode) {
              await el.setCustomAttribute("data-paystack-plan", currentConfig.planCode);
            }
            if (currentConfig.subaccountCode) {
              await el.setCustomAttribute("data-paystack-subaccount", currentConfig.subaccountCode);
            }
            if (currentConfig.splitCode) {
              await el.setCustomAttribute("data-paystack-split", currentConfig.splitCode);
            }
            if (currentConfig.emailCollection === "field" && currentConfig.emailFieldSelector) {
              await el.setCustomAttribute("data-paystack-email-field", currentConfig.emailFieldSelector);
            }
            await el.save();

            result.attributesSet = true;
            result.elementName = selectedElement.tagName || selectedElement.type;
          }
        } catch {
          // Element attribute setting failed
        }
      }

      setApplyResult(result);
    } catch (err) {
      notify(`Error: ${err instanceof Error ? err.message : "Unknown error"}`, "Error");
    } finally {
      setApplying(false);
    }
  };

  const handlePreview = () => {
    const script = generateClientScript({
      publicKey,
      config: currentConfig,
    });

    const amountAttr = currentConfig.amountMode === "fixed" && currentConfig.amount
      ? ` data-paystack-amount="${toSmallestUnit(currentConfig.amount)}"`
      : "";

    const previewHtml = `<!DOCTYPE html>
<html><head><title>Paystack Checkout Preview</title>
<style>body{font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8f9fa}
.preview{text-align:center;padding:40px;max-width:400px}
h2{margin-bottom:8px;color:#111827}
.price{font-size:24px;font-weight:700;color:#0BA4DB;margin-bottom:24px}
button{background:#0BA4DB;color:white;border:none;padding:16px 36px;border-radius:10px;font-size:16px;font-weight:600;cursor:pointer;transition:all 0.15s;box-shadow:0 2px 8px rgba(11,164,219,0.3)}
button:hover{background:#0993c5;transform:translateY(-1px);box-shadow:0 4px 12px rgba(11,164,219,0.4)}
.note{margin-top:24px;color:#9ca3af;font-size:13px}
.badge{display:inline-block;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;margin-bottom:16px}
.test{background:#fef3c7;color:#92400e}
.live{background:#ecfdf5;color:#065f46}</style></head>
<body><div class="preview">
<span class="badge ${isTestKey(publicKey) ? "test" : "live"}">${isTestKey(publicKey) ? "TEST MODE" : "LIVE"}</span>
<h2>${currentConfig.label || "Pay Now"}</h2>
${currentConfig.amount ? `<p class="price">${currentConfig.currency} ${currentConfig.amount.toLocaleString()}</p>` : ""}
<button data-paystack-button="true"${amountAttr} data-paystack-currency="${currentConfig.currency}"${currentConfig.planCode ? ` data-paystack-plan="${currentConfig.planCode}"` : ""}${currentConfig.subaccountCode ? ` data-paystack-subaccount="${currentConfig.subaccountCode}"` : ""}${currentConfig.splitCode ? ` data-paystack-split="${currentConfig.splitCode}"` : ""}>${currentConfig.label || "Pay Now"}</button>
<p class="note">${isTestKey(publicKey) ? 'Test mode — use card 4084 0840 8408 4081, exp: any future date, CVV: 408' : "Live mode — real payments will be charged"}</p>
</div>
${script}
</body></html>`;

    const blob = new Blob([previewHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  // Show setup status after successful apply
  if (applyResult) {
    const steps = [
      { label: "Payment button configured", done: true },
      {
        label: applyResult.attributesSet
          ? `Button attributes set on ${applyResult.elementName}`
          : "Select a button element before applying",
        done: applyResult.attributesSet,
      },
      {
        label: applyResult.scriptCopied
          ? "Checkout script copied to clipboard"
          : "Script generated (copy manually)",
        done: applyResult.scriptCopied,
      },
    ];

    return (
      <div className="configurator">
        <SetupStatus
          steps={steps}
          isTestMode={isTestKey(publicKey)}
          onDismiss={() => {
            setApplyResult(null);
            resetConfig();
          }}
          onPreview={handlePreview}
        />

        {!applyResult.attributesSet && (
          <div className="info-box">
            <strong>To complete setup:</strong> Select a button element in the
            Webflow Designer, then come back and click "Apply" again. The app
            will automatically add the payment attributes to your button.
          </div>
        )}

        {applyResult.scriptCopied && (
          <div className="info-box">
            <strong>Paste the script:</strong> Go to Page Settings → Custom Code
            → paste in the "Before &lt;/body&gt; tag" section, then publish.
          </div>
        )}
      </div>
    );
  }

  if (showConfigs) {
    return (
      <div className="configurator">
        <div className="section-header">
          <h3>Saved Configurations</h3>
          <Button variant="ghost" size="sm" onClick={() => setShowConfigs(false)}>
            &larr; Back
          </Button>
        </div>
        {configs.length === 0 ? (
          <p className="empty-state">No saved configurations yet.</p>
        ) : (
          <div className="config-list">
            {configs.map((cfg) => (
              <div key={cfg.id} className="config-item">
                <div className="config-item-info">
                  <strong>{cfg.label}</strong>
                  <span className="config-item-type">{cfg.paymentType.replace("_", " ")}</span>
                </div>
                <div className="config-item-actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCurrentConfig(cfg);
                      setShowConfigs(false);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteConfig(cfg.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="configurator">
      <div className="section-header">
        <h3>Configure Payment</h3>
        <div className="header-actions">
          {configs.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setShowConfigs(true)}>
              Saved ({configs.length})
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={resetConfig}>
            Reset
          </Button>
        </div>
      </div>

      <Tabs
        tabs={PAYMENT_TYPE_TABS}
        activeTab={currentConfig.paymentType}
        onTabChange={(id) => updatePaymentType(id as PaymentType)}
      />

      {currentConfig.paymentType === "one_time" && (
        <OneTimePayment
          config={currentConfig}
          onUpdateField={updateField}
          onToggleChannel={toggleChannel}
          onUpdateCurrency={updateCurrency}
        />
      )}

      {currentConfig.paymentType === "subscription" && (
        <SubscriptionSetup
          config={currentConfig}
          mode={mode}
          onUpdateField={updateField}
        />
      )}

      {currentConfig.paymentType === "split" && (
        <SplitPaymentSetup
          config={currentConfig}
          mode={mode}
          onUpdateField={updateField}
          onToggleChannel={toggleChannel}
          onUpdateCurrency={updateCurrency}
        />
      )}

      {currentConfig.paymentType === "payment_page" && (
        <PaymentPageLink />
      )}

      {currentConfig.paymentType !== "payment_page" && (
        <>
          <div className="configurator-actions">
            <Button variant="secondary" onClick={handlePreview}>
              Preview
            </Button>
            <Button onClick={handleApply} disabled={applying}>
              {applying ? "Applying..." : "Apply to Page"}
            </Button>
          </div>

          {isDesignerReady && !selectedElement && (
            <div className="element-prompt">
              Select a button element in the Designer to apply payment attributes
            </div>
          )}

          {selectedElement && (
            <div className="element-info element-selected">
              Selected: <code>{selectedElement.tagName || selectedElement.type}</code>
            </div>
          )}

          {!isDesignerReady && (
            <div className="info-box info-warning">
              Running outside Webflow Designer. Script will be copied to clipboard
              — paste it in your page's custom code settings.
            </div>
          )}
        </>
      )}
    </div>
  );
}
