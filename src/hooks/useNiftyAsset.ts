import { useMemo } from 'react';
import { AccountInfo, ParsedAccountData } from '@solana/web3.js';
import { getInternalAssetAccountDataSerializer, ASSET_PROGRAM_ID, Discriminator, Asset } from '@nifty-oss/asset';

export const useNiftyAsset = (accountInfo: AccountInfo<Buffer | ParsedAccountData> | null) => {
  return useMemo(() => {
    if (!accountInfo || accountInfo.owner.toString() !== ASSET_PROGRAM_ID) {
      return null;
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
          console.error("Unexpected data type for accountInfo.data.raw");
          return null;
        }
      } else {
        console.error("Unexpected data type for accountInfo.data");
        return null;
      }

      const [assetData] = assetSerializer.deserialize(accountData);

      if (assetData.discriminator === Discriminator.Asset) {
        return assetData as Asset;
      }
    } catch (error) {
      console.error("Error deserializing Nifty Asset data:", error);
    }

    return null;
  }, [accountInfo]);
};