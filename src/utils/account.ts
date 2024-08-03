import { NFT } from "@/types/nft";
import {
  AccountInfo,
  ConfirmedSignatureInfo,
  ParsedAccountData,
} from "@solana/web3.js";

export enum AccountType {
  Wallet = "Wallet",
  Token = "Token",
  Program = "Program",
  Closed = "Closed",
  NotFound = "NotFound",
  Unknown = "Unknown",
  MetaplexNFT = "MetaplexNFT",
  NFToken = "NFToken", // NFToken: https://nftoken.so/docs/overview
  CompressedNFT = "CompressedNFT",
  Token2022 = "Token2022",
  Token2022NFT = "Token2022NFT",
}

const SYSTEM_PROGRAM = "11111111111111111111111111111111";
const NFTOKEN_ADDRESS = "nftokf9qcHSYkVSP3P2gUMmV6d4AwjMueXgUu43HyLL";

export function getAccountType(
  accountInfo: AccountInfo<Buffer | ParsedAccountData> | null,
  signatures: ConfirmedSignatureInfo[],
  nftData?: NFT | undefined,
): AccountType {
  // Check if the account has been closed
  if (signatures && signatures.length > 0 && accountInfo === null) {
    return AccountType.Closed;
  }

  // Check if the account has never been submitted to the blockchain
  if (signatures && signatures.length === 0 && accountInfo === null) {
    return AccountType.NotFound;
  }

  if (accountInfo && accountInfo.data && "parsed" in accountInfo.data) {
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
        if (
          accountInfo.data.parsed.type === "mint" &&
          accountInfo.data.parsed.info.decimals === 0 &&
          parseInt(accountInfo.data.parsed.info.supply) === 1 &&
          accountInfo.data.parsed.info.freezeAuthority !== null // Ensure it's an NFT with a freeze authority
        ) {
          return AccountType.MetaplexNFT;
        }
        if (accountInfo.data.parsed.type === "mint") {
          return AccountType.Token;
        }
      case "spl-token-2022":
        if (
          accountInfo.data.parsed.type === "mint" &&
          accountInfo.data.parsed.info.decimals === 0 &&
          parseInt(accountInfo.data.parsed.info.supply) === 1 &&
          accountInfo.data.parsed.info.freezeAuthority !== null // Ensure it's an NFT with a freeze authority
        ) {
          return AccountType.Token2022NFT;
        }
        if (accountInfo.data.parsed.type === "mint") {
          return AccountType.Token2022;
        }
    }
  }

  // If there is no parsed data, check if the account is a program or wallet
  if (accountInfo && accountInfo.executable) {
    return AccountType.Program;
  } else if (accountInfo) {
    const owner = accountInfo.owner.toBase58();
    if (owner === SYSTEM_PROGRAM) {
      return AccountType.Wallet;
    }
    if (owner === NFTOKEN_ADDRESS) {
      return AccountType.NFToken;
    }
  }

  if (nftData?.compression?.compressed) {
    return AccountType.CompressedNFT;
  }

  return AccountType.Unknown;
}
