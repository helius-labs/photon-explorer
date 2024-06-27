"use client";

import { PublicKey } from "@solana/web3.js";
import { CheckIcon, Copy } from "lucide-react";
import * as React from "react";

import { useParseInstructions } from "@/hooks/useParseInstructions";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DataProps {
  programId: PublicKey;
  data: string;
}

export default function Data({ programId, data }: DataProps) {
  const [hasCopied, setHasCopied] = React.useState(false);
  const parsed = useParseInstructions(programId, data);

  React.useEffect(() => {
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  }, [hasCopied]);

  if (parsed.isLoading) return <div>Parsing...</div>;

  return (
    <TooltipProvider>
      <div className="flex items-center align-middle">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="mr-2 h-7 w-7 rounded-[6px] [&_svg]:size-3.5"
              onClick={() => {
                navigator.clipboard.writeText(data);
                setHasCopied(true);
              }}
            >
              <span className="sr-only">Copy</span>
              {hasCopied ? <CheckIcon /> : <Copy />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy data</TooltipContent>
        </Tooltip>
        <div className="w-[400px] break-all whitespace-pre-wrap">
          {parsed.data}
        </div>
      </div>
    </TooltipProvider>
  );
}
