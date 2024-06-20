"use client";

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
  children: string;
  short?: boolean;
  copy?: boolean;
  link?: boolean;
}

export default function Signature({
  children,
  short = true,
  copy = true,
  link = true,
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
            {link ? (
              <Link href={`/tx/${children}`} className="hover:underline">
                {short ? (
                  <>{`${children.slice(0, 4)}...${children.slice(-4)}`}</>
                ) : (
                  <>{children}</>
                )}
              </Link>
            ) : (
              <>
                {short ? (
                  <>{`${children.slice(0, 4)}...${children.slice(-4)}`}</>
                ) : (
                  <>{children}</>
                )}
              </>
            )}
          </TooltipTrigger>
          <TooltipContent>{children}</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
