import { NFT } from "@/types/nft";
import { SYSVAR_IDS } from "@/utils/programs";
import {
  AccountInfo,
  ConfirmedSignatureInfo,
  ParsedAccountData,
} from "@solana/web3.js";
import { getInternalAssetAccountDataSerializer, ASSET_PROGRAM_ID, Discriminator } from "@nifty-oss/asset";

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
  NiftyAsset = "NiftyAsset",
}

const SYSTEM_PROGRAM = "11111111111111111111111111111111";
const NFTOKEN_ADDRESS = "nftokf9qcHSYkVSP3P2gUMmV6d4AwjMueXgUu43HyLL";

const isNiftyAsset = (accountInfo: AccountInfo<Buffer | ParsedAccountData> | null): boolean => {
  if (!accountInfo || accountInfo.owner.toString() !== ASSET_PROGRAM_ID) {
    return false;
  }
  
  try {
    const assetSerializer = getInternalAssetAccountDataSerializer();
    let accountData: Uint8Array;

    if (Buffer.isBuffer(accountInfo.data)) {
      accountData = new Uint8Array(accountInfo.data);
    } else if (typeof accountInfo.data === 'object' && 'raw' in accountInfo.data) {
      const rawData = accountInfo.data.raw;
      if (rawData instanceof Uint8Array) {
        accountData = rawData;
      } else if (Array.isArray(rawData)) {
        accountData = new Uint8Array(rawData);
      } else if (rawData instanceof ArrayBuffer) {
        accountData = new Uint8Array(rawData);
      } else {
        return false;
      }
    } else {
      return false;
    }

    const [assetData] = assetSerializer.deserialize(accountData);
    return assetData.discriminator === Discriminator.Asset;
  } catch (error) {
    console.error("Error checking for Nifty Asset:", error);
    return false;
  }
};

export function getAccountType(
  accountInfo: AccountInfo<Buffer | ParsedAccountData> | null,
  signatures: ConfirmedSignatureInfo[],
  nftData?: NFT | undefined,
): AccountType {
  // Check if the account has been closed
  if (signatures && signatures.length > 0 && accountInfo === null) {
    return AccountType.Program;
  }

  // Check if the account has never been submitted to the blockchain
  if (signatures && signatures.length === 0 && accountInfo === null) {
    return AccountType.NotFound;
  }

  // Prioritize checking for compressed NFTs
  if (nftData?.compression?.compressed) {
    return AccountType.CompressedNFT;
  }

  // Check parsed account data to determine account type
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

  // Check for known sysvar program addresses
  if (accountInfo && SYSVAR_IDS[accountInfo.owner.toBase58()]) {
    return AccountType.Program;
  }

  // Check for Nifty Asset
  if (isNiftyAsset(accountInfo)) {
    return AccountType.NiftyAsset;
  }

  return AccountType.Unknown;
}
