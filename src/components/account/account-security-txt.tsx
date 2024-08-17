"use client"

import React, { useState } from "react";
import { useProgramData } from "@/hooks/useProgramData";
import { parseSecurityTxt } from "@/utils/parseSecurityTxt";
import { SecurityTxt } from "@/types/securityTxt";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import LottieLoader from "@/components/common/lottie-loading";
import loadingBarAnimation from "@/../public/assets/animations/loadingBar.json";

interface SecurityTxtProps {
    programId: string;
}

const SecurityTxtDisplay: React.FC<SecurityTxtProps> = ({ programId }) => {
  const { programData, isLoading, error } = useProgramData(programId);
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
    return <div className="error">Error loading security.txt: {error.message}</div>;
  }

  if (!programData) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">Security.txt</h1>
        <div>No program data found</div>
      </div>
    );
  }

  const { securityTxt, error: parseError } = parseSecurityTxt(programData);

  if (parseError) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">Security.txt</h1>
        <div>{parseError}</div>
      </div>
    );
  }

  if (!securityTxt) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">Security.txt</h1>
        <div>No security.txt found for this program</div>
      </div>
    );
  }

  const formatFieldValue = (key: string, value: string) => {
    if (key === "preferred_languages") {
      return value.toUpperCase();
    }
    if (key === "contacts") {
      return value.split(",").map(contact => contact.trim()).join(", ");
    }
    return value;
  };

  return (
    <div>
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
              {JSON.stringify(securityTxt, null, 2)}
            </pre>
          ) : (
            <div className="space-y-4">
              {Object.entries(securityTxt).map(([key, value]) => (
                <div key={key}>
                  <span className="font-semibold">{key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}:</span>{' '}
                  {key === 'project_url' || key === 'policy' || key === 'source_code' ? (
                    <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {value} <ExternalLink className="inline-block ml-1 h-4 w-4" />
                    </a>
                  ) : (
                    formatFieldValue(key, value)
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SecurityTxtDisplay;