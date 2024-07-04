import { PublicKey } from "@solana/web3.js";

export type Token = {
  raw: any;
  pubkey: PublicKey;
  mint: PublicKey;
  logoURI?: string;
  symbol?: string;
  name?: string;
  amount: number;
  decimals: number;
  value?: number;
  price?: number;
};
