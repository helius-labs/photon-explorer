"use client";

import * as React from "react";
import { CheckIcon, Copy } from "lucide-react";
import Link from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import Link from "@/components/ui/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SignatureProps {
  children: string;
  short?: boolean;
  copy?: boolean;
}

export default function Signature({
  children,
  short = true,
  copy = true,
}: SignatureProps) {
  const [hasCopied, setHasCopied] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  }, [hasCopied]);

  return (
    <TooltipProvider>
      <div className="flex items-center align-middle">
        {copy && (
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
            <TooltipContent>Copy transaction id</TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/tx/${children}`} className="hover:underline">
              {short ? (
                <>{`${children.slice(0, 12)}...${children.slice(-6)}`}</>
              ) : (
                <>{children}</>
              )}
            </Link>
          </TooltipTrigger>
          <TooltipContent>{children}</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
