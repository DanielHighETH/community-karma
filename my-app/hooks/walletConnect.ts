"use client";
import { useState, useEffect } from "react";
import nacl from "tweetnacl";
import { HexString } from "aptos";
import {
  SignedMessageResponse,
  WalletConnectReturn,
} from "../types/walletConnect";
import crypto from "crypto";
import {
  Aptos,
  AptosConfig,
  Network,
  NetworkToNetworkName,
} from "@aptos-labs/ts-sdk";

const walletConnect = (): WalletConnectReturn => {
  const [walletAvailable, setWalletAvailable] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.aptos) {
      setWalletAvailable(true);
    }

    checkSession();
  }, []);

  const checkSession = async (): Promise<void> => {
    try {
      const response = await fetch("/api/session", {
        method: "GET",
      });

      const data = await response.json();

      if (data.loggedIn) {
        setAddress(data.address);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Error checking session:", error);
      setIsLoggedIn(false);
    }
  };

  const connectWallet = async (): Promise<void> => {
    try {
      const response = await window.aptos.connect();

      setAddress(response.address);
      signMessage();

      checkAndMintTokens(response.address);
    } catch (error) {
      console.error("Error connecting to Petra Wallet:", error);
    }
  };

  const signMessage = async (): Promise<void> => {
    try {
      const nonce = crypto.randomBytes(16).toString("hex");

      const message = `Sign this message in order to log in. \n\nNonce: ${nonce}`;
      const response: SignedMessageResponse = await window.aptos.signMessage({
        message,
        nonce,
      });

      await verifyMessage(response);
    } catch (error: any) {
      console.error("Error signing the message:", error);
      console.log(error.message);
    }
  };

  const verifyMessage = async (
    response: SignedMessageResponse
  ): Promise<void> => {
    try {
      const { publicKey } = await window.aptos.account();
      const key = publicKey.slice(2, 66);

      const verified = nacl.sign.detached.verify(
        new TextEncoder().encode(response.fullMessage),
        new HexString(response.signature).toUint8Array(),
        new HexString(key).toUint8Array()
      );

      if (verified) {
        await generateJWT(response.address);
      } else {
        throw new Error("Message verification failed.");
      }
    } catch (error) {
      console.error("Error verifying the message:", error);
    }
  };

  const generateJWT = async (address: string): Promise<void> => {
    try {
      const response = await fetch("/api/generateJWT", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();
      if (data.success) {
        console.log("JWT token generated");
        checkSession();
      } else {
        console.error("Failed to generate JWT token.");
      }
    } catch (error) {
      console.error("Error generating JWT token:", error);
    }
  };

  const disconnectWallet = async (): Promise<void> => {
    try {
      await window.aptos.disconnect();

      const response = await fetch("/api/logout", {
        method: "GET",
      });

      const data = await response.json();
      if (data.success) {
        checkSession();
        console.log("Logged out successfully");
      } else {
        console.error("Failed to log out.");
      }
    } catch (error) {
      console.error("Error during disconnect and logout:", error);
    }
  };

  const APTOS_NETWORK = NetworkToNetworkName[Network.TESTNET];
  const aptosClientConfig = new AptosConfig({ network: APTOS_NETWORK });
  const aptosClient = new Aptos(aptosClientConfig);

  const sendTransaction = async (
    txArguments: any[],
    functionName: string
  ): Promise<any> => {
    const transactionPayload = {
      arguments: txArguments,
      function: functionName,
      type: "entry_function_payload",
      type_arguments: [],
    };

    try {
      const pendingTx = await window.aptos.signAndSubmitTransaction(
        transactionPayload
      );

      const confirmedTransaction =
        await aptosClient.transaction.waitForTransaction({
          transactionHash: pendingTx.hash,
        });

      return confirmedTransaction;
    } catch (error) {
      console.error("Error during transaction submission:", error);
    }
  };

  const checkAndMintTokens = async (userAddress: string): Promise<void> => {
    try {
      const balanceResponse = await fetch("/api/checkBalance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: userAddress }),
      });

      const { balance } = await balanceResponse.json();

      if (balance < 500) {
        console.log("Minting 30,000 KARMA tokens for the user...");

        const mintResponse = await fetch("/api/mint", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address: userAddress, amount: 30000 }),
        });

        const { txHash } = await mintResponse.json();
        console.log(`Mint transaction successful. Hash: ${txHash}`);
      } else {
        console.log("User has sufficient KARMA balance.");
      }
    } catch (error) {
      console.error("Error checking balance and minting tokens:", error);
    }
  };

  return {
    walletAvailable,
    connectWallet,
    disconnectWallet,
    address,
    isLoggedIn,
    sendTransaction,
  };
};

export default walletConnect;
