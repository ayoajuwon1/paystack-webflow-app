import { useState } from "react";
import { Tabs } from "./ui/Tabs";
import { Button } from "./ui/Button";
import { OneTimePayment } from "./OneTimePayment";
import { SubscriptionSetup } from "./SubscriptionSetup";
import { SplitPaymentSetup } from "./SplitPaymentSetup";
import { PaymentPageLink } from "./PaymentPageLink";
import { usePaystackConfig } from "../hooks/usePaystackConfig";
import { useWebflow } from "../hooks/useWebflow";
import { generateClientScript } from "../utils/script-generator";
import type { AppMode } from "../types/config";
import type { PaymentType } from "../types/paystack";
import { isValidAmount } from "../utils/validators";

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

export function PaymentConfigurator({
  publicKey,
  mode,
  backendUrl: _backendUrl,
}: PaymentConfiguratorProps) {
  void _backendUrl; // Used in Mode 2 (server-assisted script generation)
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

    setApplying(true);

    try {
      // Generate the checkout script
      const script = generateClientScript({
        publicKey,
        config: currentConfig,
      });

      // Save config
      saveConfig(currentConfig);

      // Copy script to clipboard for manual injection
      // (In production, this would use the Webflow Custom Code API)
      await navigator.clipboard.writeText(script);

      if (isDesignerReady && selectedElement) {
        // Set data attributes on the selected element
        try {
          const el = await webflow.getSelectedElement();
          if (el) {
            await el.setCustomAttribute("data-paystack-button", "true");
            await el.setCustomAttribute(
              "data-paystack-amount",
              String(currentConfig.amount)
            );
            await el.setCustomAttribute(
              "data-paystack-currency",
              currentConfig.currency
            );
            if (currentConfig.planCode) {
              await el.setCustomAttribute("data-paystack-plan", currentConfig.planCode);
            }
            if (currentConfig.subaccountCode) {
              await el.setCustomAttribute(
                "data-paystack-subaccount",
                currentConfig.subaccountCode
              );
            }
            if (currentConfig.splitCode) {
              await el.setCustomAttribute("data-paystack-split", currentConfig.splitCode);
            }
            if (currentConfig.emailCollection === "field" && currentConfig.emailFieldSelector) {
              await el.setCustomAttribute(
                "data-paystack-email-field",
                currentConfig.emailFieldSelector
              );
            }
            await el.save();
          }
        } catch {
          // Element attribute setting failed, but script is still on clipboard
        }
      }

      notify(
        "Payment configured! Script copied to clipboard. Paste it in your page's custom code (before </body>).",
        "Info"
      );
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

    // Open preview in a new window
    const previewHtml = `<!DOCTYPE html>
<html><head><title>Paystack Checkout Preview</title>
<style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f5f5f5}
.preview{text-align:center;padding:40px}
button{background:#0BA4DB;color:white;border:none;padding:14px 32px;border-radius:8px;font-size:16px;cursor:pointer}
button:hover{background:#0993c5}
.note{margin-top:20px;color:#666;font-size:13px}</style></head>
<body><div class="preview">
<button data-paystack-button="true" data-paystack-amount="${currentConfig.amount}" data-paystack-currency="${currentConfig.currency}"${currentConfig.planCode ? ` data-paystack-plan="${currentConfig.planCode}"` : ""}${currentConfig.subaccountCode ? ` data-paystack-subaccount="${currentConfig.subaccountCode}"` : ""}${currentConfig.splitCode ? ` data-paystack-split="${currentConfig.splitCode}"` : ""}>${currentConfig.label || "Pay Now"}</button>
<p class="note">This is a preview. ${publicKey.startsWith("pk_test_") ? "Using TEST mode." : "Using LIVE mode."}</p>
</div>
${script}
</body></html>`;

    const blob = new Blob([previewHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

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
                  <span className="config-item-type">{cfg.paymentType}</span>
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

      <div className="configurator-actions">
        <Button variant="secondary" onClick={handlePreview}>
          Preview
        </Button>
        <Button onClick={handleApply} disabled={applying}>
          {applying ? "Applying..." : "Apply to Page"}
        </Button>
      </div>

      {selectedElement && (
        <div className="element-info">
          Selected: <code>{selectedElement.type}</code>
          {selectedElement.tagName && (
            <> ({selectedElement.tagName})</>
          )}
        </div>
      )}

      {!isDesignerReady && (
        <div className="info-box info-warning">
          Running outside Webflow Designer. Script will be copied to clipboard
          instead of injected directly.
        </div>
      )}
    </div>
  );
}
