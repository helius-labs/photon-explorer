"use client";

import { shorten } from "@/utils/common";
import { TransactionSignature } from "@solana/web3.js";
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

interface SignatureProps {
  signature: TransactionSignature;
  short?: boolean;
  copy?: boolean;
  link?: boolean;
  truncateChars?: number;
}

export default function Signature({
  signature,
  short = false,
  copy = true,
  link = true,
  truncateChars
}: SignatureProps) {
  const [hasCopied, setHasCopied] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  }, [hasCopied]);

  let signatureLabel = signature;

  if (short) {
    signatureLabel = shorten(signature, 4);
  }

  if (truncateChars) {
    signatureLabel = signature.slice(0, truncateChars) + '…';
  }

  return (
    <TooltipProvider>
      <div className="flex items-center align-middle font-mono">
        {copy && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant={null}
                className="mr-2 h-5 w-5 rounded-[6px] [&_svg]:size-3.5"
                onClick={() => {
                  navigator.clipboard.writeText(signature);
                  setHasCopied(true);
                }}
              >
                <span className="sr-only">Copy</span>
                {hasCopied ? <CheckIcon /> : <Copy />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy signature</TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            {link ? (
              <Link href={`/tx/${signature}`} className="hover:underline">
                {signatureLabel}
              </Link>
            ) : (
              <span>{signatureLabel}</span>
            )}
          </TooltipTrigger>
          <TooltipContent>{signature}</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
