"use client";

import { PublicKey } from "@solana/web3.js";
import { CheckIcon, Copy } from "lucide-react";
import * as React from "react";

import { tokenAddressLookupTable } from "@/utils/data";

import { Button } from "@/components/ui/button";
import Link from "@/components/ui/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AddressProps {
  pubkey: PublicKey;
  short?: boolean;
  link?: boolean;
}

export default function Address({
  pubkey,
  short = true,
  link = true,
}: AddressProps) {
  const address = pubkey.toBase58();

  const [hasCopied, setHasCopied] = React.useState(false);

  const name = tokenAddressLookupTable[address] ?? null;

  React.useEffect(() => {
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  }, [hasCopied]);

  return (
    <TooltipProvider>
      <div className="inline-flex items-baseline align-baseline">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="mr-2 h-7 w-7 rounded-[6px] [&_svg]:size-3.5"
              onClick={() => {
                navigator.clipboard.writeText(address);
                setHasCopied(true);
              }}
            >
              <span className="sr-only">Copy</span>
              {hasCopied ? <CheckIcon /> : <Copy />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy address</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            {link ? (
              <Link href={`/address/${address}`} className="hover:underline">
                {short && !name ? (
                  <>{`${address.slice(0, 4)}...${address.slice(-4)}`}</>
                ) : (
                  <>{name ?? address}</>
                )}
              </Link>
            ) : (
              <>
                {short && !name ? (
                  <>{`${address.slice(0, 4)}...${address.slice(-4)}`}</>
                ) : (
                  <>{name ?? address}</>
                )}
              </>
            )}
          </TooltipTrigger>
          <TooltipContent>{address}</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
