import React from 'react';
import { PublicKey } from '@solana/web3.js';
import { Asset, ExtensionType, getExtension } from '@nifty-oss/asset';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import Link from "next/link";
import { shorten, shortenLong } from "@/utils/common";
import ViewMediaButton from "@/components/common/view-media-button";

interface AccountHeaderNiftyAssetProps {
  address: PublicKey;
  asset: Asset;
}

const AccountHeaderNiftyAsset: React.FC<AccountHeaderNiftyAssetProps> = ({ address, asset }) => {
  const metadata = getExtension(asset, ExtensionType.Metadata);

  return (
    <TooltipProvider>
      <div className="mx-[-1rem] md:mx-0">
        <Card className="mb-8 w-full space-y-4 p-6 md:h-auto md:space-y-6">
          <CardHeader className="relative flex flex-col items-center gap-4 md:flex-row md:items-start md:gap-6">
            <div className="relative flex-shrink-0 w-full md:w-72 h-72">
              <ViewMediaButton nft={asset} />
            </div>
            <div className="flex w-full flex-col">
              <div className="flex w-full flex-col justify-between md:flex-row md:items-start">
                <div className="max-w-sm flex-grow text-center md:text-left">
                  <CardTitle className="text-3xl font-medium leading-none">
                    <div className="flex flex-col items-center md:flex-row md:justify-start">
                      <span className="max-w-full md:max-w-none">
                        {asset.name || <span>{shortenLong(address.toString())}</span>}
                      </span>
                      <div className="mt-2 flex space-x-2 md:ml-2 md:mt-0">
                        <Badge variant="success">Nifty Asset</Badge>
                        <Badge variant="outline">{asset.standard === 0 ? "Non-Fungible" : asset.standard}</Badge>
                        {asset.mutable && <Badge variant="outline">Mutable</Badge>}
                      </div>
                    </div>
                  </CardTitle>
                  {metadata && metadata.symbol && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {metadata.symbol}
                    </div>
                  )}
                </div>
              </div>
              {metadata && metadata.description && (
                <div className="md:text-md mt-2 max-w-md text-center text-sm text-foreground md:text-left">
                  <span>{metadata.description}</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            <div className="text-md grid grid-cols-1 gap-4 text-center text-muted-foreground sm:grid-cols-2 md:text-left lg:grid-cols-3">
              <div>
                <span className="font-semibold text-foreground">Owner: </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={`/address/${asset.owner.toString()}`} className="hover:underline">
                      {shorten(asset.owner.toString())}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>{asset.owner.toString()}</TooltipContent>
                </Tooltip>
              </div>
              <div>
                <span className="font-semibold text-foreground">Authority: </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={`/address/${asset.authority.toString()}`} className="hover:underline">
                      {shorten(asset.authority.toString())}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>{asset.authority.toString()}</TooltipContent>
                </Tooltip>
              </div>
              <div>
                <span className="font-semibold text-foreground">State: </span>
                {asset.state === 0 ? "Unlocked" : "Locked"}
              </div>
              {asset.delegate && (
                <div>
                  <span className="font-semibold text-foreground">Delegate: </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={`/address/${asset.delegate.address?.toString()}`} className="hover:underline">
                        {shorten(asset.delegate.address?.toString() || '')}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>{asset.delegate.address?.toString()}</TooltipContent>
                  </Tooltip>
                </div>
              )}
              <div>
                <span className="font-semibold text-foreground">Mutable: </span>
                {asset.mutable ? "Yes" : "No"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default AccountHeaderNiftyAsset;