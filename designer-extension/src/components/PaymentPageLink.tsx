import { useState } from "react";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";

export function PaymentPageLink() {
  const [pageUrl, setPageUrl] = useState("");
  const [label, setLabel] = useState("Pay Now");
  const [copied, setCopied] = useState(false);

  const isValidPaystackUrl =
    pageUrl.includes("paystack.com/pay/") || pageUrl.includes("paystack.com/pay-");

  const embedCode = `<a href="${pageUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 32px;background:#0BA4DB;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;font-family:sans-serif">${label}</a>`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="payment-fields">
      <div className="info-box">
        <p>
          Create a payment page in your{" "}
          <a
            href="https://dashboard.paystack.com/#/pages"
            target="_blank"
            rel="noopener noreferrer"
          >
            Paystack Dashboard
          </a>
          , then paste the URL below to generate an embed button.
        </p>
      </div>

      <Input
        label="Payment Page URL"
        value={pageUrl}
        onChange={(e) => setPageUrl(e.target.value)}
        placeholder="https://paystack.com/pay/your-page-slug"
        error={pageUrl && !isValidPaystackUrl ? "Enter a valid Paystack payment page URL" : ""}
      />

      <Input
        label="Button Label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Pay Now"
      />

      {pageUrl && isValidPaystackUrl && (
        <>
          <div className="input-group">
            <label className="input-label">Preview</label>
            <div className="preview-box">
              <a
                href={pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  padding: "14px 32px",
                  background: "#0BA4DB",
                  color: "#fff",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "16px",
                }}
              >
                {label}
              </a>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Embed Code</label>
            <pre className="code-block">{embedCode}</pre>
          </div>

          <Button onClick={handleCopy} fullWidth>
            {copied ? "Copied!" : "Copy Embed Code"}
          </Button>
        </>
      )}
    </div>
  );
}
