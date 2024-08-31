"use client";

import { AccountType } from "@/utils/account";
import {
  AccountInfo,
  ConfirmedSignatureInfo,
  ParsedAccountData,
  PublicKey,
} from "@solana/web3.js";
import React from "react";

import { useGetNFTsByMint } from "@/hooks/useGetNFTsByMint";
import { useNiftyAsset } from "@/hooks/useNiftyAsset";

import AccountHeaderNFTs from "@/components/account/account-headers/account-header-nfts";
import AccountHeaderPrograms from "@/components/account/account-headers/account-header-programs";
import AccountHeaderTokens from "@/components/account/account-headers/account-header-tokens";
import AccountHeaderUnknown from "@/components/account/account-headers/account-header-unknown";
import AccountHeaderWallets from "@/components/account/account-headers/account-header-wallet";
import AccountHeaderNiftyAsset from "@/components/account/account-headers/account-header-nifty";
import { Tab } from "../tab-nav";

interface AccountHeaderProps {
  address: PublicKey;
  accountInfo: AccountInfo<Buffer | ParsedAccountData> | null;
  signatures: ConfirmedSignatureInfo[];
  accountType: AccountType;
  onTabsUpdate: (updatedTabs: Tab[]) => void; // Include this in the props
}

const AccountHeader: React.FC<AccountHeaderProps> = ({
  address,
  accountInfo,
  signatures,
  accountType,
  onTabsUpdate,
}) => {
  // Fetch NFT data if it's possible that this is an NFT or compressed NFT
  const shouldFetchNFT = 
    accountType === AccountType.Token2022NFT ||
    accountType === AccountType.MetaplexNFT ||
    accountType === AccountType.NFToken ||
    accountType === AccountType.NotFound ||
    accountType === AccountType.CompressedNFT;

  const { data: nftData } = useGetNFTsByMint(address.toBase58(), shouldFetchNFT);

  const asset = useNiftyAsset(accountInfo);

  const isCompressedNFT = nftData?.compression?.compressed;

  const renderAccountHeader = () => {
    if (shouldFetchNFT && isCompressedNFT) {
      return <AccountHeaderNFTs address={address} nft={nftData || null} />;
    }

    if (asset) {
      return <AccountHeaderNiftyAsset address={address} asset={asset} />;
    }

    switch (accountType) {
      case AccountType.Token:
        return <AccountHeaderTokens address={address} onTabsUpdate={onTabsUpdate} />;
      case AccountType.Token2022:
        return <AccountHeaderTokens address={address} type="Token2022" onTabsUpdate={onTabsUpdate} />;
      case AccountType.Token2022NFT:
      case AccountType.MetaplexNFT:
      case AccountType.NFToken:
      case AccountType.CompressedNFT:
        return <AccountHeaderNFTs address={address} nft={nftData || null} />;
      case AccountType.Wallet:
        return (
          <AccountHeaderWallets
            address={address}
            accountInfo={accountInfo}
          />
        );
      case AccountType.Program:
        return <AccountHeaderPrograms address={address} accountInfo={accountInfo} />;
      case AccountType.Unknown:
      default:
        return <AccountHeaderUnknown address={address} />;
    }
  };

  return <div>{renderAccountHeader()}</div>;
};

export default AccountHeader;

