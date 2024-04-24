"use client";

import { useQuery } from "@tanstack/react-query";
import { useCluster } from "@/components/cluster-provider";

export function useTransaction(signature: string) {
  const { endpoint } = useCluster();

  const { data, error, isLoading } = useQuery({
    queryKey: [endpoint, signature],
    queryFn: async () => {
      console.log("endpoint", endpoint);
      console.log("signature", signature);

      return fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getTransaction",
          params: [signature, "jsonParsed"],
        }),
      })
        .then((res) => res.json())
        .then((res) => res.result);
    },
  });

  return {
    transaction: data,
    isLoading,
    isError: error,
  };
}
