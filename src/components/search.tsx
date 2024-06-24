"use client";

import { useCluster } from "@/providers/cluster-provider";
import { SearchIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import {
  isSolanaAccountAddress,
  isSolanaProgramAddress,
  isSolanaSignature,
} from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  programAddressLookupTable,
  tokenAddressLookupTable,
} from "@/lib/data";

export function Search({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const router = useRouter();
  const { cluster } = useCluster();
  const [search, setSearch] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    if (value) {
      const programSuggestions = Object.values(programAddressLookupTable)
        .filter((name) =>
          name.toLowerCase().includes(value.toLowerCase())
        );
      const tokenSuggestions = Object.values(tokenAddressLookupTable)
        .filter((name) =>
          name.toLowerCase().includes(value.toLowerCase())
        );

      setSuggestions([...programSuggestions, ...tokenSuggestions]);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearch(suggestion);
    setSuggestions([]);
  };

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!search) {
      return;
    }

    // Reverse lookup in program and token address lookup tables
    const programAddress = Object.keys(programAddressLookupTable).find(
      (key) =>
        programAddressLookupTable[key].toLowerCase() === search.toLowerCase()
    );
    const tokenAddress = Object.keys(tokenAddressLookupTable).find(
      (key) =>
        tokenAddressLookupTable[key].toLowerCase() === search.toLowerCase()
    );

    if (programAddress) {
      router.push(`/address/${programAddress}/?cluster=${cluster}`);
      return;
    }

    if (tokenAddress) {
      router.push(`/address/${tokenAddress}/?cluster=${cluster}`);
      return;
    }

    // Check if is a Solana program address
    if (isSolanaProgramAddress(search)) {
      router.push(`/address/${search}/?cluster=${cluster}`);
      return;
    }

    // Check if is a Solana account address
    if (isSolanaAccountAddress(search)) {
      router.push(`/address/${search}/?cluster=${cluster}`);
      return;
    }

    // Check if is transaction id
    if (isSolanaSignature(search)) {
      router.push(`/tx/${search}/?cluster=${cluster}`);
      return;
    }

    // Default to address if no specific match
    router.push(`/address/${search}/?cluster=${cluster}`);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <form onSubmit={onFormSubmit} className="flex flex-col items-center space-y-4">
        <div className="relative w-full">
          <Input
            startIcon={SearchIcon}
            type="search"
            placeholder="Search for accounts, transactions, programs, or tokens..."
            value={search}
            onChange={handleInputChange}
            className="h-12 w-full"
            iconClassName="left-4"
            inputPaddingClassName="pl-12 pr-4"
            endiconclassname="right-6"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="p-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <Button type="submit" variant="outline" disabled={!search}>
          Search
        </Button>
      </form>
    </div>
  );
}
