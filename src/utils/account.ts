import { AccountInfo, ParsedAccountData, PublicKey } from "@solana/web3.js";

export enum AccountType {
  Wallet = "Wallet",
  Token = "Token",
  Program = "Program",
  Unknown = "Unknown",
}

export function getAccountType(
  accountInfo: AccountInfo<Buffer | ParsedAccountData> | null,
): AccountType {
  if (!accountInfo) {
    return AccountType.Unknown;
  }

  if (accountInfo.data && "parsed" in accountInfo.data) {
    switch (accountInfo.data.program) {
      case "bpf-upgradeable-loader":
      case "stake":
      case "vote":
      case "nonce":
      case "sysvar":
      case "config":
      case "address-lookup-table":
        return AccountType.Program;
      case "spl-token":
      case "spl-token-2022":
        if (accountInfo.data.parsed.type === "mint") {
          return AccountType.Token;
        }
    }
  }

  // If there is no parsed data, check if the account is a program or wallet
  if (accountInfo.executable) {
    return AccountType.Program;
  } else if (
    accountInfo.owner.toBase58() === "11111111111111111111111111111111"
  ) {
    return AccountType.Wallet;
  }

  return AccountType.Unknown;
}

export function createEmptyAccountInfo(
  owner: PublicKey,
): AccountInfo<Buffer | ParsedAccountData> {
  return {
    executable: false,
    lamports: 0,
    owner,
    rentEpoch: 0,
    data: Buffer.alloc(0),
  };
}
