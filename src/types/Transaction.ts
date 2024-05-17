export type Transaction = {
  slot: number;
  signature: string;
  signer?: string;
  err: string | null;
  fee?: number;
  blockTime: number;
};
