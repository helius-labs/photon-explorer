import { PublicKey } from "@solana/web3.js";

export type Attribute = {
  value: string;
  trait_type: string;
};

export type Creators = {
  address: string;
  share: number;
  verified: boolean;
};

export interface Royalty {
  royalty_model: string;
  target?: string;
  percent: number;
  basis_points: number;
  primary_sale_happened: boolean;
  locked: boolean;
}

export type NFT = {
  raw: any;
  mint: PublicKey;
  name?: string;
  image?: string;
  description?: string;
  owner?: string;
  mintAuthority?: string;
  updateAuthority?: string;
  collection?: string;
  tokenStandard?: string;
  creators?: Creators[];
  attributes?: Attribute[];
  verified?: boolean;
  value?: number;
  royalty?: Royalty;
};
