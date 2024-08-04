import { useCluster } from "@/providers/cluster-provider";
import { AnchorProvider, Idl, Program } from "@coral-xyz/anchor";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";

export async function grabIdl(
  accountAddress: string,
  apiKey: string,
): Promise<Idl | null> {
  const { endpoint } = useCluster();
  try {
    const connection = new Connection(
      `${endpoint}?api-key=${apiKey}`,
      "confirmed",
    );

    const dummyKeypair = Keypair.generate();
    const dummyWallet = {
      publicKey: dummyKeypair.publicKey,
      signAllTransactions: <T extends Transaction | VersionedTransaction>(
        txs: T[],
      ): Promise<T[]> => Promise.resolve(txs),
      signTransaction: <T extends Transaction | VersionedTransaction>(
        tx: T,
      ): Promise<T> => Promise.resolve(tx),
    };

    const provider = new AnchorProvider(
      connection,
      dummyWallet,
      AnchorProvider.defaultOptions(),
    );

    const accountPubkey = new PublicKey(accountAddress);
    const idl = (await Program.fetchIdl(accountPubkey, provider)) as Idl | null;

    return idl;
  } catch (error) {
    return null;
  }
}
