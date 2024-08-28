import {
  WalletLabelItem as LocalWalletLabelItem,
  accountTags,
} from "@/data/account-tags";
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
        // Check local data first
        const localWalletInfo = accountTags.find(
          (account: LocalWalletLabelItem) => account.address === address,
        );

        if (localWalletInfo) {
          setLabel(localWalletInfo.name);
          setLabelType(localWalletInfo.type);
        } else {
          // If no local match, fetch from API
          const response = await fetch(`/api/wallet-label?address=${address}`);
          if (!response.ok) {
            throw new Error("Failed to fetch wallet label");
          }
          const ResponseData = await response.json();
          // console.log("api data:", ResponseData);
          setLabel(ResponseData.data[0]?.label || null);
          setLabelType(ResponseData.data[0]?.label_type || null);
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

  return { label, labelType, isLoading, error };
}
