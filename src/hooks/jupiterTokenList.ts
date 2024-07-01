"use client";

import { getTokenListAll, getTokenListStrict } from "@/server/getTokenList";
import { useQuery } from "@tanstack/react-query";

export function useGetTokenListAll(enabled: boolean = true) {
  return useQuery({
    queryKey: ["getTokenListAll"],
    queryFn: getTokenListAll,
    enabled,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useGetTokenListStrict(enabled: boolean = true) {
  return useQuery({
    queryKey: ["getTokenListStrict"],
    queryFn: getTokenListStrict,
    enabled,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
