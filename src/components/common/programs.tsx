"use client";

import { CheckIcon, Copy } from "lucide-react";
import * as React from "react";

import { programAddressLookupTable } from "@/lib/data";

import { Button } from "@/components/ui/button";
import Link from "@/components/ui/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProvidersProps {
  pubkey: string;
}

export default function Providers({ pubkey }: ProvidersProps) {
  const [hasCopied, setHasCopied] = React.useState(false);
  const providerImageUri = "https://static.jup.ag/jup/icon.png";
  const name = programAddressLookupTable[pubkey] ?? null;

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
      <div className="flex items-center align-middle">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant={null}
              className="mr-2 h-7 w-7 rounded-[6px] [&_svg]:size-3.5"
              onClick={() => {
                navigator.clipboard.writeText(pubkey);
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
          <img src={providerImageUri} alt={name} className="h-5 w-5 mr-1 rounded-md" />
          <TooltipTrigger asChild>
            <Link href={`/address/${pubkey}`} className="hover:underline">
              {name}
            </Link>
          </TooltipTrigger>
          <TooltipContent>{pubkey}</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
