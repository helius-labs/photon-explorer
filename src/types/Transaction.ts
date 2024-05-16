export type Transaction = {
  signature: string;
  slot: number;
  err: string | null;
  fee?: number;
  blockTime: number;
};
