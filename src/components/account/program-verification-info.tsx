"use client"

import React, { useState } from "react";
import { useProgramVerification } from '@/hooks/useProgramVerification';
import { VerificationStatus } from "@/types/verifiable-build";
import LottieLoader from "../common/lottie-loading";
import loadingBarAnimation from "@/../public/assets/animations/loadingBar.json";
import { Card } from "../ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from 'lucide-react';
import { formatDate } from "@/utils/dateFormatter";

interface ProgramVerificationInfoProps {
  programId: string;
}

const ProgramVerificationInfo: React.FC<ProgramVerificationInfoProps> = ({ programId }) => {
  const { verificationStatus, isLoading, error } = useProgramVerification(programId);
  const [showRawJson, setShowRawJson] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LottieLoader
          animationData={loadingBarAnimation}
          className="h-32 w-32"
        />
      </div>
    );
  }

  if (error) {
    return <div className="error">{error.message}</div>;
  }

  return (
    <div>
      {verificationStatus ? (
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
                {JSON.stringify(verificationStatus, null, 2)}
              </pre>
            ) : (
              <VerificationInfo verificationStatus={verificationStatus} />
            )}
          </div>
        </Card>
      ) : (
        <div className="p-4">
          <h1 className="text-2xl font-semibold mb-4">Program Verification</h1>
          <div>No verification information found for this program</div>
        </div>
      )}
    </div>
  );
};

const VerificationInfo: React.FC<{ verificationStatus: VerificationStatus }> = ({ verificationStatus }) => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold mb-4">Program Verification</h1>
      <div className="flex items-center">
        <span className="font-semibold mr-2">Status:</span>
        <Badge variant={verificationStatus.is_verified ? "success" : "destructive"}>
          {verificationStatus.is_verified ? "Verified" : "Not Verified"}
        </Badge>
      </div>
      <div>
        <span className="font-semibold">Message:</span> {verificationStatus.message}
      </div>
      {verificationStatus.is_verified && (
        <>
          <div className="flex flex-row space-x-1">
            <span className="font-semibold">
                On-chain Hash: 
            </span>
            <code className="text-orange-500">
                {verificationStatus.on_chain_hash}
            </code>
          </div>
          <div className="flex flex-row space-x-1">
            <span className="font-semibold">
                Executable Hash:
            </span> 
            <code className="text-orange-500">
                {verificationStatus.executable_hash}
            </code>
          </div>
          <div>
            <span className="font-semibold">
                Last Verified:
            </span> 
            {formatDate(verificationStatus.last_verified_at)}
          </div>
          <div className="flex items-center">
            <span className="font-semibold mr-2">Repository:</span>
            <a href={verificationStatus.repo_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
              View Source <ExternalLink className="ml-1 h-4 w-4" />
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default ProgramVerificationInfo;