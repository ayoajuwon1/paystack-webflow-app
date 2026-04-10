import { SetupWizard } from "./components/SetupWizard";
import { Layout } from "./components/Layout";
import { PaymentConfigurator } from "./components/PaymentConfigurator";
import { useMode } from "./hooks/useMode";
import { isTestKey } from "./utils/validators";
import type { AppMode } from "./types/config";

export default function App() {
  const { state, setMode, setPublicKey, setBackendUrl, completeSetup, resetSetup } =
    useMode();

  const handleSetupComplete = (
    mode: AppMode,
    publicKey: string,
    backendUrl: string
  ) => {
    setMode(mode);
    if (publicKey) setPublicKey(publicKey);
    if (backendUrl) setBackendUrl(backendUrl);
    completeSetup();
  };

  if (!state.isSetupComplete) {
    return <SetupWizard onComplete={handleSetupComplete} />;
  }

  return (
    <Layout
      onSettingsClick={resetSetup}
      isTestMode={state.publicKey ? isTestKey(state.publicKey) : false}
    >
      <PaymentConfigurator
        publicKey={state.publicKey}
        mode={state.mode}
        backendUrl={state.backendUrl}
      />
    </Layout>
  );
}
