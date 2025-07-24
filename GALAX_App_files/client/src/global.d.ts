declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      isMetaMask?: boolean;
      selectedAddress?: string | null;
      networkVersion?: string;
      on?: (eventName: string, callback: (...args: any[]) => void) => void;
      removeListener?: (eventName: string, callback: (...args: any[]) => void) => void;
    };
  }
}

export {};