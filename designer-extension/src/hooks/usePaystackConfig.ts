import { useState, useCallback } from "react";
import type {
  PaymentButtonConfig,
  PaymentType,
  PaystackCurrency,
  PaystackChannel,
} from "../types/paystack";
import { DEFAULT_CHANNELS } from "../types/paystack";

const CONFIGS_KEY = "paystack-payment-configs";

function loadConfigs(): PaymentButtonConfig[] {
  try {
    const stored = localStorage.getItem(CONFIGS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return [];
}

function saveConfigs(configs: PaymentButtonConfig[]) {
  localStorage.setItem(CONFIGS_KEY, JSON.stringify(configs));
}

function createId(): string {
  return `psc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createDefaultConfig(): PaymentButtonConfig {
  return {
    id: createId(),
    paymentType: "one_time",
    label: "Pay Now",
    amount: 0,
    currency: "NGN",
    channels: [...DEFAULT_CHANNELS],
    successUrl: "",
    cancelUrl: "",
    emailCollection: "prompt",
    emailFieldSelector: "",
    planCode: "",
    subaccountCode: "",
    splitCode: "",
    metadata: {},
  };
}

export function usePaystackConfig() {
  const [configs, setConfigs] = useState<PaymentButtonConfig[]>(loadConfigs);
  const [currentConfig, setCurrentConfig] = useState<PaymentButtonConfig>(
    createDefaultConfig
  );

  const saveConfig = useCallback(
    (config: PaymentButtonConfig) => {
      setConfigs((prev) => {
        const existing = prev.findIndex((c) => c.id === config.id);
        const next =
          existing >= 0
            ? prev.map((c) => (c.id === config.id ? config : c))
            : [...prev, config];
        saveConfigs(next);
        return next;
      });
    },
    []
  );

  const deleteConfig = useCallback((id: string) => {
    setConfigs((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveConfigs(next);
      return next;
    });
  }, []);

  const updateField = useCallback(
    <K extends keyof PaymentButtonConfig>(
      field: K,
      value: PaymentButtonConfig[K]
    ) => {
      setCurrentConfig((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const updatePaymentType = useCallback((type: PaymentType) => {
    setCurrentConfig((prev) => ({ ...prev, paymentType: type }));
  }, []);

  const updateCurrency = useCallback((currency: PaystackCurrency) => {
    setCurrentConfig((prev) => ({ ...prev, currency }));
  }, []);

  const toggleChannel = useCallback((channel: PaystackChannel) => {
    setCurrentConfig((prev) => {
      const channels = prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel];
      return { ...prev, channels };
    });
  }, []);

  const resetConfig = useCallback(() => {
    setCurrentConfig(createDefaultConfig());
  }, []);

  return {
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
  };
}
