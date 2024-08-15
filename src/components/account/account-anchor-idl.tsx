"use client"

import React, { useEffect, useState } from "react";
import { grabIdl } from "@/utils/grabIdls";
import { useCluster } from "@/providers/cluster-provider";
import { Idl } from "@coral-xyz/anchor";
import LottieLoader from "../common/lottie-loading";
import loadingBarAnimation from "@/../public/assets/animations/loadingBar.json";
import { Card } from "../ui/card";
import { Button } from "@/components/ui/button";
import IdlParser from "./idl-parser";

interface AnchorIdlProps {
  address: string;
}

const AnchorIdl: React.FC<AnchorIdlProps> = ({ address }) => {
  const { endpoint } = useCluster();
  const [idl, setIdl] = useState<Idl | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState<boolean>(false);

  useEffect(() => {
    const fetchIdl = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedIdl = await grabIdl(address, endpoint || "");
        setIdl(fetchedIdl);
      } catch (err) {
        setError("Failed to fetch IDL");
      } finally {
        setLoading(false);
      }
    };

    fetchIdl();
  }, [address, endpoint]);

  if (loading) {
    return <LottieLoader animationData={loadingBarAnimation} />;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      {idl ? (
        <Card className="col-span-12 mx-[-1rem] mb-10 overflow-hidden md:mx-0 relative">
          <div className="absolute top-2 right-2 z-10 flex space-x-2 p-2 rounded">
            <Button
              onClick={() => setShowRawJson(false)}
              variant={showRawJson ? "secondary" : "default"}
              size="sm"
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
          <div className="p-8 pt-16">
            {showRawJson ? (
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(idl, null, 2)}
              </pre>
            ) : (
              <IdlParser idl={idl} />
            )}
          </div>
        </Card>
      ) : (
        <div className="p-4">
          <h1 className="text-2xl font-semibold mb-4">Anchor IDL</h1>
          <div>No IDL found for this program</div>
        </div>
      )}
    </div>
  );
};

export default AnchorIdl;
