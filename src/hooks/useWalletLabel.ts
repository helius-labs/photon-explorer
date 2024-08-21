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
  const [labelType, setLabelType] = useState<string | null>(null);
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
        const response = await fetch(`/api/wallet-label?address=${address}`);
        if (!response.ok) {
          throw new Error("Failed to fetch wallet label");
        }
        const responseData = await response.json();

        let labelValue: string | null = null;
        let labelTypeValue: string | null = null;
        if (
          responseData &&
          responseData.data &&
          Array.isArray(responseData.data) &&
          responseData.data.length > 0
        ) {
          const item = responseData.data[0] as WalletLabelItem;
          labelValue = item.label || item.address_name || null;
          labelTypeValue = item.label_type || item.label_subtype || null;
        }

        setLabel(labelValue);
        setLabelType(labelTypeValue);

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

  useEffect(() => {}, [label, labelType, isLoading, error]);

  return { label, labelType, isLoading, error };
}
