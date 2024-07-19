"use client";

import React, { useState } from "react";
import { useGetNFTsByMint } from "@/hooks/useGetNFTsByMint";
import { useGetTokensByMint } from "@/hooks/useGetTokensByMint";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ChevronDown, Copy, Check, FileJson } from "lucide-react";

type MetadataViewerProps = {
  data: any;
};

const MetadataViewer: React.FC<MetadataViewerProps> = ({ data }) => {
  const [showCode, setShowCode] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const formattedMetadata = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedMetadata);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <Card className="col-span-12 mb-10 shadow-lg border rounded-lg">
      <CardContent className="flex flex-col gap-6 p-8">
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
            <ScrollArea className="mt-4 h-96 w-full overflow-auto rounded-lg p-">
              <pre className="bg-background text-muted-foreground p-6 rounded-lg shadow-inner">
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
                  <TooltipContent>Copy JSON</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

type Props = {
  address: string;
};

const AccountMetadata: React.FC<Props> = ({ address }) => {
  const { data: nftData } = useGetNFTsByMint(address);
  const { data: tokenData } = useGetTokensByMint(address);

  return (
    <div className="p-8">
      {nftData && <MetadataViewer data={nftData.raw} />}
      {tokenData && <MetadataViewer data={tokenData.raw} />}
      {!nftData && !tokenData && <p className="text-center text-muted-foreground">No metadata found for the given address.</p>}
    </div>
  );
};

export default AccountMetadata;
