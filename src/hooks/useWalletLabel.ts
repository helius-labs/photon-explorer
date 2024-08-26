import { WalletLabelItem, accountTags } from "@/data/account-tags";
import { useEffect, useState } from "react";

export function useWalletLabel(address: string) {
  const [label, setLabel] = useState<string | null>(null);
  const [labelType, setLabelType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLabel = () => {
      if (!address) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setLabel(null);

      try {
        const walletInfo = accountTags.find(
          (account: WalletLabelItem) => account.address === address,
        );

        if (walletInfo) {
          setLabel(walletInfo.name);
          setLabelType(walletInfo.type); // Use the first tag as the label type
        } else {
          setLabel(null);
          setLabelType(null);
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
