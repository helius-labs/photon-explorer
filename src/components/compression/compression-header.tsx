"use client";

import solLogo from "@/../public/assets/solanaLogoMark.svg";
import { lamportsToSolString } from "@/utils/common";
import { CompressedAccountWithMerkleContext } from "@lightprotocol/stateless.js";
import { PublicKey } from "@solana/web3.js";
import Avatar from "boring-avatars";
import Image from "next/image";

import Address from "@/components/common/address";
import { Badge } from "@/components/ui/badge";

export function CompressionHeader({
  address,
  compressedAccount,
}: {
  address: PublicKey;
  compressedAccount: CompressedAccountWithMerkleContext | null;
}) {
  return (
    <div className="mb-8 flex flex-col items-center gap-4 md:flex-row">
      <Avatar
        size={64}
        name={address.toBase58()}
        variant="marble"
        colors={["#D31900", "#E84125", "#9945FF", "#14F195", "#000000"]}
      />
      <div className="grid gap-2">
        <div className="text-center text-3xl font-medium leading-none md:text-left">
          <div className="flex items-center justify-center gap-2 md:justify-start">
            <Address pubkey={address} />
            <Badge variant="success">Compressed</Badge>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 md:flex-row">
          {compressedAccount && (
            <span className="flex items-center text-lg text-muted-foreground">
              <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-black p-1.5">
                <Image
                  src={solLogo}
                  alt="SOL logo"
                  loading="eager"
                  width={24}
                  height={24}
                />
              </div>
              {`${lamportsToSolString(compressedAccount.lamports, 2)} SOL`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
