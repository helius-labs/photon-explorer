"use client";

import { CheckIcon, Copy } from "lucide-react";
import * as React from "react";

import { ScrollArea } from "@/components/ui//scroll-area";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DataProps {
  data: string;
}

export default function Data({ data }: DataProps) {
  const [hasCopied, setHasCopied] = React.useState(false);

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
              variant="ghost"
              className="mr-2 h-5 w-5 rounded-[6px] [&_svg]:size-3.5"
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
        <ScrollArea className="h-52 w-[300px] md:w-[400px] lg:w-[600px] bg-neutral-100 dark:bg-neutral-900 rounded-lg">
          <div className="p-4 break-all whitespace-pre-wrap">{data}</div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}
