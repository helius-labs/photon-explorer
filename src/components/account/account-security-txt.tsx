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

  const formatFieldValue = (key: string, value: string | undefined): React.ReactNode => {
    if (!value) return "N/A";

    if (key === "preferred_languages") {
      return value.toUpperCase();
    }
    if (key === "contacts") {
      return value.split(",").map((contact, index) => {
        const trimmedContact = contact.trim();
        if (trimmedContact.startsWith("email:")) {
          const email = trimmedContact.substring(6);
          return <a key={index} href={`mailto:${email}`} className="text-blue-500 hover:underline">{email}</a>;
        }
        if (trimmedContact.startsWith("http")) {
          return <a key={index} href={trimmedContact} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{trimmedContact} <ExternalLink className="inline-block ml-1 h-4 w-4" /></a>;
        }
        return <span key={index}>{trimmedContact}</span>;
      }).reduce((prev, curr, index) => index === 0 ? [curr] : [...prev, ", ", curr], [] as React.ReactNode[]);
    }
    return value;
  };

  const formatFieldName = (key: string) => {
    const specialCases: { [key: string]: string } = {
      "project_url": "Project URL",
      "source_code": "Source Code",
      "source_release": "Source Release",
      "source_revision": "Source Revision",
    };
    return specialCases[key] || key.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  const orderedKeys: (keyof SecurityTxt)[] = [
    "name", "project_url", "contacts", "policy", "source_code",
    "source_release", "source_revision", "preferred_languages",
    "encryption", "auditors", "acknowledgements", "expiry"
  ];

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
          <div className="border-l-4 border-yellow-500 p-4 mb-4 rounded">
            <p className="text-sm">
              <strong>Disclaimer:</strong> The security.txt content is self-reported by the program author and may not be 100% accurate.
            </p>
          </div>
          {showRawJson ? (
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(securityTxt, null, 2)}
            </pre>
          ) : (
            <div className="space-y-4">
              {orderedKeys.map((key) => {
                if (key in securityTxt) {
                  return (
                    <div key={key}>
                      <span className="font-semibold">{formatFieldName(key)}:</span>{" "}
                      {["project_url", "policy", "source_code"].includes(key) ? (
                        <a href={securityTxt[key]} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          {securityTxt[key]} <ExternalLink className="inline-block ml-1 h-4 w-4" />
                        </a>
                      ) : (
                        formatFieldValue(key, securityTxt[key])
                      )}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SecurityTxtDisplay;