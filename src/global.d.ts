/// <reference types="chrome" />

interface Window {
  unisat: {
    getPublicKey: () => Promise<string>;
    signPsbt: (psbtHex: string) => Promise<string>;
    getBalance: () => Promise<any>;
    sendBitcoin: (address: string, amount: number) => Promise<any>;
    requestAccounts: () => Promise<string[]>;
    switchNetwork: (
      network: "livenet" | "testnet",
    ) => Promise<"livenet" | "testnet">;
  };
}
