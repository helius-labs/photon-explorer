"use client";

import { useCluster } from "@/providers/cluster-provider";
import {
  isSolanaAccountAddress,
  isSolanaProgramAddress,
  isSolanaSignature,
  shortenLong
} from "@/utils/common";
import { tokenAddressLookupTable } from "@/utils/data";
import { PROGRAM_INFO_BY_ID } from "@/utils/programs";
import { Circle, CogIcon, SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Search({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const router = useRouter();
  const { cluster } = useCluster();
  const [search, setSearch] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<{ name: string; icon: JSX.Element; type?: string }[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    const newSuggestions = [];

    if (value) {
      const programSuggestions = Object.entries(PROGRAM_INFO_BY_ID)
        .filter(([address, { name, deployments }]) => {
          if (!deployments.includes(cluster)) return false;
          return (
            name.toLowerCase().includes(search.toLowerCase()) ||
            address.includes(search)
          );
        })
        .map(([address, { name }]) => ({ name, icon: <CogIcon />, type: 'Program' }));

      const tokenSuggestions = Object.values(tokenAddressLookupTable)
        .filter((name) => name.toLowerCase().includes(value.toLowerCase()))
        .map((name) => ({ name, icon: <Circle />, type: 'Token' }));

      newSuggestions.push(...programSuggestions, ...tokenSuggestions);

      if (isSolanaProgramAddress(value) || isSolanaAccountAddress(value) || isSolanaSignature(value)) {
        newSuggestions.push({ name: value, icon: <SearchIcon />, type: 'Input' });
      }
    }

    setSuggestions(newSuggestions);
    console.log("Suggestions: ", newSuggestions); // Debugging line
  };

  const handleSuggestionClick = (suggestion: { name: string }) => {
    setSearch(suggestion.name);
    setSuggestions([]);
  };

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!search) {
      return;
    }

    // Reverse lookup in program and token address lookup tables
    const programEntry = Object.entries(PROGRAM_INFO_BY_ID).find(
      ([address, { name }]) => name.toLowerCase() === search.toLowerCase(),
    );

    const tokenEntry = Object.entries(tokenAddressLookupTable).find(
      ([, entry]) => entry.toLowerCase() === search.toLowerCase(),
    );

    if (programEntry) {
      router.push(`/address/${programEntry[0]}/?cluster=${cluster}`);
      return;
    }

    if (tokenEntry) {
      router.push(`/address/${tokenEntry[0]}/?cluster=${cluster}`);
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
    <div className="relative w-full max-w-lg mx-auto px-4 md:px-0">
      <form
        onSubmit={onFormSubmit}
        className="flex flex-col items-center space-y-4"
      >
        <div className="relative w-full">
          <Input
            startIcon={SearchIcon}
            type="search"
            placeholder="Search for accounts, transactions, programs, or tokens..."
            value={search}
            onChange={handleInputChange}
            className="h-12 w-full overflow-hidden"
            iconClassName="left-4"
            inputPaddingClassName="pl-12 pr-4"
            endiconclassname="right-6"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="p-2 cursor-pointer hover:bg-secondary flex items-center gap-2"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.icon}
                  {suggestion.type === 'Input' ? `Search for "${shortenLong(suggestion.name)}"` : (suggestion.name)}
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
