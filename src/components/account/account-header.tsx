"use client";

import React from "react";
import { AccountInfo, ConfirmedSignatureInfo, ParsedAccountData, PublicKey } from "@solana/web3.js";
import { AccountType } from "@/utils/account";
import AccountHeaderTokens from "@/components/account/account-headers/account-header-tokens";
import AccountHeaderNFTs from "@/components/account/account-headers/account-header-nfts";
import AccountHeaderWallets from "@/components/account/account-headers/account-header-wallet";
import AccountHeaderPrograms from "@/components/account/account-headers/account-header-programs";
import AccountHeaderUnknown from "@/components/account/account-headers/account-header-unknown";

interface AccountHeaderProps {
  address: PublicKey;
  accountInfo: AccountInfo<Buffer | ParsedAccountData> | null;
  signatures: ConfirmedSignatureInfo[];
  accountType: AccountType;
}

const AccountHeader: React.FC<AccountHeaderProps> = ({ address, accountInfo, signatures, accountType }) => {
  const renderAccountHeader = () => {
    switch (accountType) {
      case AccountType.Token:
        return <AccountHeaderTokens address={address} />;
      case AccountType.MetaplexNFT:
      case AccountType.NFToken:
        return <AccountHeaderNFTs address={address} />;
      case AccountType.Wallet:
        return <AccountHeaderWallets address={address} accountInfo={accountInfo} solPrice={null} />;
      case AccountType.Program:
        return <AccountHeaderPrograms address={address} />;
      case AccountType.Unknown:
      default:
        return <AccountHeaderUnknown address={address} />;
    }
  };

  return (
    <div>
      {renderAccountHeader()}
    </div>
  );
};

export default AccountHeader;
