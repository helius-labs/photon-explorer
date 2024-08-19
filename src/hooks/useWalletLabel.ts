import { useEffect, useState } from "react";

interface WalletLabelItem {
  address: string;
  address_name?: string;
  label?: string;
  label_subtype?: string;
  label_type?: string;
}

export function useWalletLabel(address: string) {
  const [label, setLabel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLabel = async () => {
      if (!address) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setLabel(null);

      try {
        console.log("Fetching label for address:", address);
        const response = await fetch(`/api/wallet-label?address=${address}`);
        if (!response.ok) {
          throw new Error("Failed to fetch wallet label");
        }
        const responseData = await response.json();
        console.log("Received data in hook:", responseData);

        let labelValue: string | null = null;
        if (
          responseData &&
          responseData.data &&
          Array.isArray(responseData.data) &&
          responseData.data.length > 0
        ) {
          const item = responseData.data[0] as WalletLabelItem;
          labelValue = item.label || item.address_name || null;
        }

        console.log("Extracted label value:", labelValue);
        setLabel(labelValue);

        if (!labelValue) {
          console.warn("No label found in the API response");
        }
      } catch (err) {
        console.error("Error fetching wallet label:", err);
        setError(err instanceof Error ? err : new Error("An error occurred"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchLabel();
  }, [address]);

  useEffect(() => {
    console.log("Current label state:", label);
    console.log("Current loading state:", isLoading);
    console.log("Current error state:", error);
  }, [label, isLoading, error]);

  return { label, isLoading, error };
}
