export type AppMode = "client" | "server";

export interface AppState {
  mode: AppMode;
  isSetupComplete: boolean;
  publicKey: string;
  backendUrl: string;
}

export const DEFAULT_APP_STATE: AppState = {
  mode: "client",
  isSetupComplete: false,
  publicKey: "",
  backendUrl: "",
};
