import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  onSettingsClick: () => void;
  isTestMode: boolean;
}

export function Layout({ children, onSettingsClick, isTestMode }: LayoutProps) {
  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-brand">
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#0BA4DB" />
            <path
              d="M8 12h16v2H8v-2zm0 4h12v2H8v-2zm0 4h16v2H8v-2z"
              fill="white"
            />
          </svg>
          <span className="layout-title">Paystack</span>
          {isTestMode && <span className="test-badge">TEST</span>}
        </div>
        <button className="settings-btn" onClick={onSettingsClick} title="Settings">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 10a2 2 0 100-4 2 2 0 000 4zm6.32-1.906l-1.12-.65a5.07 5.07 0 000-1.288l1.12-.65a.25.25 0 00.09-.338l-1-1.732a.25.25 0 00-.338-.09l-1.12.65a5.06 5.06 0 00-1.116-.645V2.25a.25.25 0 00-.25-.25h-2a.25.25 0 00-.25.25v1.3A5.06 5.06 0 007.22 4.196l-1.12-.65a.25.25 0 00-.338.09l-1 1.732a.25.25 0 00.09.338l1.12.65a5.07 5.07 0 000 1.288l-1.12.65a.25.25 0 00-.09.338l1 1.732a.25.25 0 00.338.09l1.12-.65a5.06 5.06 0 001.116.645v1.3a.25.25 0 00.25.25h2a.25.25 0 00.25-.25v-1.3a5.06 5.06 0 001.116-.645l1.12.65a.25.25 0 00.338-.09l1-1.732a.25.25 0 00-.09-.338z" />
          </svg>
        </button>
      </header>
      <main className="layout-content">{children}</main>
    </div>
  );
}
