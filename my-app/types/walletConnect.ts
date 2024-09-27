export interface SignedMessageResponse {
  signature: string;
  fullMessage: string;
}

export interface WalletConnectReturn {
  walletAvailable: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  address: string | null;
  isLoggedIn: boolean;
}
