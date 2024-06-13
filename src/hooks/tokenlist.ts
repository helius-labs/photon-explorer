"use client";

import { useQuery } from "@tanstack/react-query";

import { tokenListSchema } from "@/schemas/tokenList";

export function useGetTokenListAll(enabled: boolean = true) {
  const endpoint = "/token-list-all";

  return useQuery({
    queryKey: [endpoint],
    queryFn: async () => {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json());

      return tokenListSchema.parse(response.data);
    },
    enabled,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useGetTokenListStrict(enabled: boolean = true) {
  const endpoint = "/token-list-strict";

  return useQuery({
    queryKey: [endpoint],
    queryFn: async () => {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json());

      return tokenListSchema.parse(response.data);
    },
    enabled,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
