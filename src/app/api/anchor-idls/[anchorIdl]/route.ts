import { MAINNET_BETA_URL } from "@/../../src/utils/cluster";
import { AnchorProvider, Idl, Program } from "@coral-xyz/anchor";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { NextResponse } from "next/server";

type Params = {
  params: {
    address: string;
  };
};

async function grabIdl(accountAddress: string): Promise<Idl | null> {
  const connection = new Connection(
    `${MAINNET_BETA_URL}?api-key=${process.env.HELIUS_API_KEY}`,
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
}

export async function GET(_request: Request, { params: { address } }: Params) {
  if (!process.env.HELIUS_API_KEY || !address) {
    return NextResponse.json(
      { error: "API key or account parameter not set", success: false },
      { status: 400 },
    );
  }

  try {
    const idl = await grabIdl(address);

    if (idl) {
      return NextResponse.json({ idl });
    } else {
      return NextResponse.json(
        { error: "IDL not found", success: false },
        { status: 404 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch IDL", success: false },
      { status: 500 },
    );
  }
}
