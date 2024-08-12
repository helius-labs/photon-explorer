"use client";

import React, { useState } from "react";
import { useGetNFTsByMint } from "@/hooks/useGetNFTsByMint";
import { useGetTokensByMint } from "@/hooks/useGetTokensByMint";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ChevronDown, Copy, Check, FileJson } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type MetadataViewerProps = {
  data: any;
};

const MetadataViewer: React.FC<MetadataViewerProps> = ({ data }) => {
  const [showCode, setShowCode] = useState(true);
  const [hasCopied, setHasCopied] = useState(false);

  const formattedMetadata = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedMetadata);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="mx-[-1rem] md:mx-0">
      <Card className="w-full mb-10 shadow-lg rounded-lg overflow-hidden">
        <CardContent className="flex flex-col gap-6 p-6 md:p-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileJson className="h-10 w-10 text-muted-foreground" />
              <h4 className="ml-4 text-2xl font-semibold text-muted-foreground">JSON Metadata</h4>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="ml-2 h-10 w-10 rounded-lg [&_svg]:size-8"
              onClick={() => setShowCode(!showCode)}
            >
              <ChevronDown className={`transition-transform ${showCode ? "rotate-180" : ""}`} />
            </Button>
          </div>
          {showCode && (
            <>
              <ScrollArea className="mt-4 h-96 w-full overflow-auto rounded-lg">
                <pre className="bg-background text-muted-foreground p-6 rounded-lg shadow-inner w-full">
                  <code className="text-xs whitespace-pre-wrap break-all">{formattedMetadata}</code>
                </pre>
              </ScrollArea>
              <div className="flex justify-end mt-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex items-center space-x-2 rounded-lg px-4 py-2"
                        onClick={handleCopy}
                      >
                        <span className="text-sm text-muted-foreground">Copy JSON</span>
                        {hasCopied ? <Check className="h-5 w-5 text-muted-foreground" /> : <Copy className="h-5 w-5 text-muted-foreground" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>Copy JSON</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const MetadataSkeleton: React.FC = () => {
  return (
    <div className="mx-[-1rem] md:mx-0">
      <Card className="w-full mb-10 shadow-lg rounded-lg overflow-hidden">
        <CardContent className="flex flex-col gap-6 p-6 md:p-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Skeleton className="h-10 w-10 rounded-full" /> {/* Skeleton for the icon */}
              <Skeleton className="ml-4 h-6 w-36" /> {/* Skeleton for the title */}
            </div>
            <Skeleton className="h-10 w-10 rounded-lg" /> {/* Skeleton for the button */}
          </div>
          <ScrollArea className="mt-4 h-96 w-full overflow-auto rounded-lg">
            <div className="bg-background h-96 p-6 rounded-lg shadow-inner w-full space-y-4">
              <Skeleton className="h-4 w-56" /> {/* Skeleton lines */}
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-4 w-72" />
            </div>
          </ScrollArea>
          <div className="flex justify-end mt-4">
            <Skeleton className="h-10 w-28 rounded-lg" /> {/* Skeleton for the copy button */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

type Props = {
  address: string;
};

const AccountMetadata: React.FC<Props> = ({ address }) => {
  const { data: nftData, isLoading: nftLoading, isError: nftError } = useGetNFTsByMint(address);
  const { data: tokenData, isLoading: tokenLoading, isError: tokenError } = useGetTokensByMint(address);

  if (nftLoading || tokenLoading) {
    return <MetadataSkeleton />; // Replace the loading text with the skeleton component
  }

  if (nftError || tokenError) {
    return <p className="text-center text-muted-foreground">Failed to load metadata.</p>;
  }

  return (
    <div className="w-full">
      <div className="max-w-screen-lg mx-auto">
        {nftData && <MetadataViewer data={nftData.raw} />}
        {tokenData && <MetadataViewer data={tokenData.raw} />}
        {!nftData && !tokenData && <p className="text-center text-muted-foreground">No metadata found for the given address.</p>}
      </div>
    </div>
  );
};

export default AccountMetadata;
