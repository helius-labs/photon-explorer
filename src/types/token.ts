import { PublicKey } from "@solana/web3.js";

export interface Token {
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
  supply?: number;
  mint_authority?: string;
  freeze_authority?: string;
  token_program?: string;
}
