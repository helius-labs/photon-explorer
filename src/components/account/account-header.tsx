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

import AccountHeaderNFTs from "@/components/account/account-headers/account-header-nfts";
import AccountHeaderPrograms from "@/components/account/account-headers/account-header-programs";
import AccountHeaderTokens from "@/components/account/account-headers/account-header-tokens";
import AccountHeaderUnknown from "@/components/account/account-headers/account-header-unknown";
import AccountHeaderWallets from "@/components/account/account-headers/account-header-wallet";

interface AccountHeaderProps {
  address: PublicKey;
  accountInfo: AccountInfo<Buffer | ParsedAccountData> | null;
  signatures: ConfirmedSignatureInfo[];
  accountType: AccountType;
}

const AccountHeader: React.FC<AccountHeaderProps> = ({
  address,
  accountInfo,
  signatures,
  accountType,
}) => {
  const { data: nftData } = useGetNFTsByMint(address.toBase58(), true);

  const nft = nftData || null;

  const renderAccountHeader = () => {
    if (nft?.compression?.compressed) {
      return <AccountHeaderNFTs address={address} nft={nft} />;
    }
    switch (accountType) {
      case AccountType.Token:
        return <AccountHeaderTokens address={address} />;
      case AccountType.Token2022:
        return <AccountHeaderTokens address={address} type="Token2022" />;
      case AccountType.Token2022NFT:
        return <AccountHeaderNFTs address={address} type="Token2022" nft={nft} />;
      case AccountType.MetaplexNFT:
        return <AccountHeaderNFTs address={address} nft={nft} />;
      case AccountType.NFToken:
        return <AccountHeaderNFTs address={address} nft={nft} />;
      case AccountType.CompressedNFT:
        return <AccountHeaderNFTs address={address} nft={nft} />;
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
