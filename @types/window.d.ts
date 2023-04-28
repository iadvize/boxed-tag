export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    iAdvizeInterface: {
      config: Record<string, unknown>;
      push: (arg: Function) => void;
    } & Array<Function>;
    iAdvizeSandboxedInterface: {
      push: (param: { method: string; args?: unknown }) => void;
    };

    // Parent host dimensions, to support the iAdvize Sandboxed Tag
    // See https://docs.google.com/document/d/1xwLckXlmerlatxunwr6-EYsba7nAqOh3t90i-GW-GhQ
    host?: {
      width: number;
      height: number;
    };
  }
}
