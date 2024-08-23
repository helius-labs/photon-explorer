"use client";
import loadingBarAnimation from "@/../public/assets/animations/loadingBar.json";
import React, { useState } from "react";
import { useGetTokensByMint } from "@/hooks/useGetTokensByMint";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LottieLoader from "./common/lottie-loading";
import { Button } from "@/components/ui/button";
import MintExtensionRenderer from "./account/mint-extension-renderer";

interface MintExtensionsProps {
  address: string;
}

const MintExtensions: React.FC<MintExtensionsProps> = ({ address }) => {
  const [showRawJson, setShowRawJson] = useState<boolean>(false);
  const { data: mintData, isLoading, isError } = useGetTokensByMint(address);

  if (isLoading) {
    return (
      <div className="mt-20 flex justify-center">
        <LottieLoader
          animationData={loadingBarAnimation}
          className="h-32 w-32 opacity-80"
        />
      </div>
    );
  }

  if (isError) return <div>Error loading mint extensions</div>;

  const mintExtensions = mintData?.raw?.mint_extensions;

  const renderParsedExtensions = () => {
    if (!mintExtensions) return null;

    return Object.entries(mintExtensions).map(([key, value]) => (
      <MintExtensionRenderer 
        key={key} 
        name={key} 
        data={value} 
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
        {mintExtensions ? (
          showRawJson ? (
            <pre className="p-4 rounded-lg overflow-auto">
              {JSON.stringify(mintExtensions, null, 2)}
            </pre>
          ) : (
            <div className="p-4 rounded-lg overflow-auto">
              {renderParsedExtensions()}
            </div>
          )
        ) : (
          <div>No mint extensions found</div>
        )}
      </CardContent>
    </Card>
  );
};

export default MintExtensions;