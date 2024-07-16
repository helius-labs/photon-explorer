import React from "react";

import { Card, CardContent } from "../ui/card";

export function ErrorCard({
  retry,
  retryText,
  text,
  subtext,
}: {
  retry?: () => void;
  retryText?: string;
  text: string;
  subtext?: string;
}) {
  const buttonText = retryText || "Try Again";
  return (
    <Card>
      <CardContent className="pt-6">
        {text}
        {retry && (
          <>
            <span
              className="btn btn-white d-none d-md-inline ms-3"
              onClick={retry}
            >
              {buttonText}
            </span>
            <div className="d-block d-md-none mt-4">
              <span className="btn btn-white w-100" onClick={retry}>
                {buttonText}
              </span>
            </div>
            {subtext && (
              <div className="text-muted">
                <hr></hr>
                {subtext}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
