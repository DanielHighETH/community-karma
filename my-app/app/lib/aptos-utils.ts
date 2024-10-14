import {
  Aptos,
  AptosConfig,
  Network,
  NetworkToNetworkName,
  AccountAddress,
  Ed25519PrivateKey,
  HexInput,
  Account,
} from "@aptos-labs/ts-sdk";

const APTOS_NETWORK = NetworkToNetworkName[Network.TESTNET];
const aptosClientConfig = new AptosConfig({ network: APTOS_NETWORK });
const aptosClient = new Aptos(aptosClientConfig);

const karmaAdminPrivateKey = new Ed25519PrivateKey(
  process.env.KARMA_ADMIN_PRIVATE_KEY as HexInput
);
const karmaAdminAccount = Account.fromPrivateKey({
  privateKey: karmaAdminPrivateKey,
});

const KARMA_DECIMALS = Math.pow(10, 7);

async function mint(
  recipientAddress: string,
  tokenAmount: number
): Promise<string> {
  try {
    const recipient = AccountAddress.from(recipientAddress);
    const mintAmount = tokenAmount * KARMA_DECIMALS;

    const mintTransaction = await aptosClient.transaction.build.simple({
      sender: karmaAdminAccount.accountAddress,
      data: {
        function: `${karmaAdminAccount.accountAddress}::karmaTech::mint`,
        functionArguments: [recipient, mintAmount],
      },
    });

    const signedTx = aptosClient.transaction.sign({
      signer: karmaAdminAccount,
      transaction: mintTransaction,
    });

    const result = await aptosClient.transaction.submit.simple({
      transaction: mintTransaction,
      senderAuthenticator: signedTx,
    });

    await aptosClient.transaction.waitForTransaction({
      transactionHash: result.hash,
    });
    return result.hash;
  } catch (error) {
    throw new Error(`Error minting KARMA tokens: ${(error as Error).message}`);
  }
}

async function payout(noteId: number, reasonId: number): Promise<string> {
  try {
    const payoutTransaction = await aptosClient.transaction.build.simple({
      sender: karmaAdminAccount.accountAddress,
      data: {
        function: `${karmaAdminAccount.accountAddress}::karmaTech::payout`,
        functionArguments: [noteId, reasonId],
      },
    });

    const signedPayoutTx = aptosClient.transaction.sign({
      signer: karmaAdminAccount,
      transaction: payoutTransaction,
    });

    const result = await aptosClient.transaction.submit.simple({
      transaction: payoutTransaction,
      senderAuthenticator: signedPayoutTx,
    });

    await aptosClient.transaction.waitForTransaction({
      transactionHash: result.hash,
    });
    return result.hash;
  } catch (error) {
    throw new Error(`Error processing payout: ${(error as Error).message}`);
  }
}

async function tokenBalance(address: string): Promise<number> {
  try {
    const accountAddress = AccountAddress.from(address);

    const resources = await aptosClient.getAccountCoinsData({
      accountAddress,
    });

    const karmaResource = resources.find(
      (resource) =>
        resource.metadata?.asset_type ===
        "0x33bc5f8101c8a226cf2b5ec15db980064422ae5dec1ade5cf065794db63c4c50"
    );

    if (!karmaResource) {
      console.warn(`KARMA token not found for address: ${address}`);
      return 0;
    }

    const karmaBalance = Number(karmaResource.amount) / 1e7;
    return karmaBalance;
  } catch (error) {
    console.error("Error fetching KARMA token balance:", error);
    throw new Error("Failed to retrieve KARMA token balance.");
  }
}

export { mint, payout, tokenBalance };
