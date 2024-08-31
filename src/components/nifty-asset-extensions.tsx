"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExtensionType } from '@nifty-oss/asset';
import NiftyAssetExtensionRenderer from "@/components/account/nifty-asset-extension-renderer";
import { useNiftyAsset } from "@/hooks/useNiftyAsset";
import { useGetAccountInfo } from "@/hooks/web3";
import LottieLoader from "@/components/common/lottie-loading";
import loadingBarAnimation from "@/../public/assets/animations/loadingBar.json";

interface NiftyAssetExtensionsProps {
  address: string;
}

const NiftyAssetExtensions: React.FC<NiftyAssetExtensionsProps> = ({ address }) => {
  const [showRawJson, setShowRawJson] = useState<boolean>(false);
  const { data: accountInfo, isLoading: isAccountInfoLoading } = useGetAccountInfo(address);
  const asset = useNiftyAsset(accountInfo?.value || null);

  if (isAccountInfoLoading) {
    return (
      <div className="mt-20 flex justify-center">
        <LottieLoader
          animationData={loadingBarAnimation}
          className="h-32 w-32 opacity-80"
        />
      </div>
    );
  }

  if (!asset) {
    return <div>No Nifty Asset found at this address</div>;
  }

  const renderParsedExtensions = () => {
    return asset.extensions.map((extension, index) => (
      <NiftyAssetExtensionRenderer
        key={index}
        name={ExtensionType[extension.type]}
        data={extension}
        isTopLevel={true}
      />
    ));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-end items-center">
          <div>
            <Button
              onClick={() => setShowRawJson(false)}
              variant={showRawJson ? "secondary" : "default"}
              size="sm"
              className="mr-2"
            >
              Parsed
            </Button>
            <Button
              onClick={() => setShowRawJson(true)}
              variant={showRawJson ? "default" : "secondary"}
              size="sm"
            >
              Raw JSON
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {asset.extensions.length > 0 ? (
          showRawJson ? (
            <pre className="p-4 rounded-lg overflow-auto">
              {JSON.stringify(asset.extensions, null, 2)}
            </pre>
          ) : (
            <div className="p-4 rounded-lg overflow-auto">
              {renderParsedExtensions()}
            </div>
          )
        ) : (
          <div>No extensions found</div>
        )}
      </CardContent>
    </Card>
  );
};

export default NiftyAssetExtensions;