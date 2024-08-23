import { XrayTransaction } from "@/utils/parser";
import { ParsedTransactionWithMeta } from "@solana/web3.js";

export const JITO_TIP_ADDRESSES = [
  "96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5",
  "HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe",
  "Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY",
  "ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49",
  "DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh",
  "ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt",
  "DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL",
  "3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT",
];

export const MINIMUM_TIP_AMOUNT = 1000;

export const isJitoTip = (toAddress: string, amount: number): boolean => {
    return JITO_TIP_ADDRESSES.includes(toAddress) && amount >= MINIMUM_TIP_AMOUNT;
};

export const isJitoTransaction = (data: ParsedTransactionWithMeta): boolean => {
  if (!data.transaction.message.instructions) return false;

  return data.transaction.message.instructions.some((instruction) => {
    if ("parsed" in instruction && instruction.parsed.type === "transfer") {
      const { destination, lamports } = instruction.parsed.info;

      return (
        JITO_TIP_ADDRESSES.includes(destination) &&
        Number(lamports) >= MINIMUM_TIP_AMOUNT
      );
    }
    return false;
  });
};

export const isJitoTransactionXray = (data: XrayTransaction): boolean => {
  return data.nativeTransfers.some((transfer) => JITO_TIP_ADDRESSES.includes(transfer.toUserAccount) && transfer.amount >= MINIMUM_TIP_AMOUNT);
};
