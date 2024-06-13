"use client";

import { CheckIcon, Copy } from "lucide-react";
import * as React from "react";

import { programAddressLookupTable, tokenAddressLookupTable } from "@/lib/data";

import { Button, ButtonProps } from "@/components/ui/button";
import Link from "@/components/ui/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AddressProps {
  children: string;
  short?: boolean;
}

export default function Address({ children, short = true }: AddressProps) {
  const [hasCopied, setHasCopied] = React.useState(false);

  const name = tokenAddressLookupTable[children] ?? null;

  React.useEffect(() => {
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
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
                navigator.clipboard.writeText(children);
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
            <Link href={`/address/${children}`} className="hover:underline">
              {short && !name ? (
                <>{`${children.slice(0, 6)}...${children.slice(-4)}`}</>
              ) : (
                <>{name ?? children}</>
              )}
            </Link>
          </TooltipTrigger>
          <TooltipContent>{children}</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
