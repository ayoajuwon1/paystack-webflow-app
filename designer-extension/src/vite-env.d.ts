/// <reference types="vite/client" />

declare const webflow: {
  notify: (options: { type: "Info" | "Error"; message: string }) => void;
  subscribe: (
    event: "selectedelement",
    callback: (element: {
      id: string;
      type: string;
      tagName?: string;
      setCustomAttribute: (name: string, value: string) => Promise<void>;
      save: () => Promise<void>;
    } | null) => void
  ) => () => void;
  getSelectedElement: () => Promise<{
    id: string;
    type: string;
    tagName?: string;
    setCustomAttribute: (name: string, value: string) => Promise<void>;
    save: () => Promise<void>;
  } | null>;
  getAllPages: () => Promise<Array<{ id: string; name: string }>>;
};

declare class PaystackPop {
  newTransaction(config: Record<string, unknown>): void;
  resumeTransaction(config: Record<string, unknown>): void;
}
