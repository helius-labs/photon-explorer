import { VerificationStatus } from "@/types/verifiable-build";
import { useEffect, useState } from "react";

export const useProgramVerification = (programId: string) => {
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        const response = await fetch(
          `https://verify.osec.io/status/${programId}`,
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch verification status for ${programId}`,
          );
        }

        const data = await response.json();
        setVerificationStatus(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error(
                "An error occurred fetching the program's verification status",
              ),
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchVerificationStatus();
  }, [programId]);

  return { verificationStatus, isLoading, error };
};
