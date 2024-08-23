import React, { useState, useEffect } from "react";
import { PublicKey, AccountInfo, ParsedAccountData } from "@solana/web3.js";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckIcon, Copy, MoreVertical, XIcon } from "lucide-react";
import { useCluster } from "@/providers/cluster-provider";
import { Cluster } from "@/utils/cluster";
import { shortenLong } from "@/utils/common";
import { PROGRAM_INFO_BY_ID, SPECIAL_IDS, SYSVAR_IDS } from "@/utils/programs";

import { useProgramVerification } from "@/hooks/useProgramVerification";
import { useWalletLabel } from "@/hooks/useWalletLabel";

import Address from "@/components/common/address";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AccountHeaderProgramsProps {
  address: PublicKey;
  accountInfo: AccountInfo<Buffer | ParsedAccountData> | null;
}

const AccountHeaderPrograms: React.FC<AccountHeaderProgramsProps> = ({ address, accountInfo }) => {
  const [hasCopied, setHasCopied] = useState(false);
  const router = useRouter();
  const { cluster, endpoint } = useCluster();
  const programId = address.toBase58();
  const programInfo = PROGRAM_INFO_BY_ID[programId];
  const specialInfo = SPECIAL_IDS[programId];
  const sysvarInfo = SYSVAR_IDS[programId];
  const displayName = programInfo ? programInfo.name : specialInfo ? specialInfo : sysvarInfo ? sysvarInfo : "Unknown Account";
  
  const { verificationStatus, isLoading: isVerificationLoading } = useProgramVerification(programId);
  const { label, labelType, isLoading: loadingLabel } = useWalletLabel(programId);

  useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  const isLocalOrTestNet = [
    Cluster.Localnet,
    Cluster.Testnet,
    Cluster.Custom,
  ].includes(cluster);

  return (
    <div className="flex justify-between items-center px-4 py-3 md:py-6 md:px-8 bg-background space-x-4">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* SVG Icon with border */}
        <div className="flex items-center justify-center p-1.5">
          <Image
            src="/assets/programIcon.svg"
            alt="Program Icon"
            width={88}
            height={88}
          />
        </div>

        {/* Program Information */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-3">
            <h2 className="text-[20px] font-medium leading-none font-['JetBrains Mono'] text-foreground">
              {displayName || <Address pubkey={address} short />}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="text-sm text-[#B88076] font-['Geist Mono'] font-medium">PROGRAM</div>
            <div className="w-[3px] h-[3px] bg-[#51271F]" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-['Geist Mono']">{shortenLong(address.toBase58())}</span>
                </TooltipTrigger>
                <TooltipContent>{address.toBase58()}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      navigator.clipboard.writeText(address.toBase58());
                      setHasCopied(true);
                    }}
                  >
                    {hasCopied ? <CheckIcon className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy address</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {!loadingLabel && label && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Label:</span> {label} ({labelType})
            </div>
          )}
        </div>
      </div>

      {/* Right Section (Verifiable Build Box) */}
      <div className="flex items-center space-x-4">
        {!isVerificationLoading && (
          <div className="flex border border-border-prominent p-2">
            <div className="flex flex-col justify-center px-2">
              <div className="flex justify-start items-center gap-2">
                {verificationStatus?.is_verified ? (
                  <>
                    <CheckIcon className="text-[#18FF84] w-4 h-4" />
                    <span className="text-muted-foreground text-[13px] leading-[18px]">
                      Verified Build
                    </span>
                  </>
                ) : (
                  <>
                    <XIcon className="text-[#E84125] w-4 h-4" />
                    <span className="text-muted-foreground text-[13px] leading-[18px]">
                      Unverified Build
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dropdown for Compressed Accounts */}
        {isLocalOrTestNet && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  router.push(`/address/${address.toBase58()}/compressed-accounts?cluster=${endpoint}`);
                }}
              >
                Compressed Accounts
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export default AccountHeaderPrograms;