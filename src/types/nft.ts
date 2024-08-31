import { Asset } from "@nifty-oss/asset";
import { PublicKey } from "@solana/web3.js";
import { NextFlightResponse } from "next/dist/server/app-render/types";

export type Attribute = {
  value: string;
  trait_type: string;
};

export type Creator = {
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

export interface File {
  uri: string;
  cdn_uri: string;
  mime: string;
}

export interface Metadata {
  attributes: Attribute[];
  description: string;
  name: string;
  symbol: string;
}

export interface Authority {
  address: string;
  scopes: string[];
}

export interface CollectionMetadata {
  name: string;
  symbol: string;
  image: string;
  description: string;
  external_url: string;
}

export interface Grouping {
  group_key: string;
  group_value: string;
  collection_metadata: CollectionMetadata;
}

export interface Supply {
  print_max_supply: number;
  print_current_supply: number;
  edition_nonce: number;
}

export interface Inscription {
  order: number;
  size: number;
  contentType: string;
  encoding: string;
  validationHash: string;
  inscriptionDataAccount: string;
}

export interface Spl20 {
  p: string;
  op: string;
  tick: string;
  amt: string;
}

export interface Compression {
  eligible: boolean;
  compressed: boolean;
  data_hash: string;
  creator_hash: string;
  asset_hash: string;
  tree: string;
  seq: number;
  leaf_id: number;
}

export interface Ownership {
  frozen: boolean;
  delegated: boolean;
  delegate: null | string;
  ownership_model: string;
  owner: string;
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
  collectionName?: string;
  tokenStandard?: string;
  creators?: Creator[];
  attributes?: Attribute[];
  verified?: boolean;
  value?: number;
  royalty?: Royalty;
  royaltyPercentage?: number;
  interface?: string;
  id?: string;
  content?: {
    $schema: string;
    json_uri: string;
    files: File[];
    metadata: Metadata;
    links: Record<string, string>;
  };
  authorities?: Authority[];
  compression?: Compression;
  grouping?: Grouping[];
  ownership?: Ownership;
  supply?: Supply | null;
  mutable?: boolean;
  burnt?: boolean;
  inscription?: Inscription;
  spl20?: Spl20;
};

export interface NFTMediaProps {
  nft: NFT | Asset;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  onMediaLoad?: (url: string) => void;
};