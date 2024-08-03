"use client";

import { useCluster } from "@/providers/cluster-provider";
import { shorten } from "@/utils/common";
import { PublicKey } from "@solana/web3.js";
import { CheckIcon, Copy } from "lucide-react";
import * as React from "react";

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
  showCopyButton?: boolean;
}

export default function Address({
  pubkey,
  short = true,
  link = true,
  showCopyButton = true,
}: AddressProps) {
  const address = pubkey.toBase58();

  const [hasCopied, setHasCopied] = React.useState(false);

  const display = address;

  let addressLabel = display;
  if (short && display === address) {
    addressLabel = shorten(display, 4);
  }

  React.useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => {
        setHasCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  return (
    <TooltipProvider>
      <div className="inline-flex items-baseline align-baseline">
        {showCopyButton && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="mr-2 h-5 w-5 rounded-[6px] [&_svg]:size-3.5"
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
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            {link ? (
              <Link href={`/address/${address}`} className="hover:underline">
                {addressLabel}
              </Link>
            ) : (
              <>{addressLabel}</>
            )}
          </TooltipTrigger>
          <TooltipContent>{address}</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
