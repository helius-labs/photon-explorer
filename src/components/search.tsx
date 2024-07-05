"use client";

import noImg from "@/../public/assets/noimg.svg";
import { useCluster } from "@/providers/cluster-provider";
import {
  isSolanaAccountAddress,
  isSolanaProgramAddress,
  isSolanaSignature,
  shortenLong,
} from "@/utils/common";
import cloudflareLoader from "@/utils/imageLoader";
import { PROGRAM_INFO_BY_ID } from "@/utils/programs";
import { Circle, CogIcon, SearchIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as React from "react";

import { useGetTokenListStrict } from "@/hooks/jupiterTokenList";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Suggestion {
  name: string;
  icon: JSX.Element;
  type: string;
  address?: string;
  logoURI?: string;
}

async function resolveAddress(address: string): Promise<string | null> {
  const response = await fetch(
    `https://sns-sdk-proxy.bonfida.workers.dev/resolve/${address.toLowerCase()}`,
  );
  const data = await response.json();
  if (data.s === "ok") {
    return data.result;
  }
  return null;
}

export function Search({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const router = useRouter();
  const { cluster } = useCluster();
  const [search, setSearch] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = React.useState<number>(-1);

  const { data: tokenList, isLoading: tokenListLoading } =
    useGetTokenListStrict();

  const suggestionsRef = React.useRef<HTMLUListElement>(null);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        document.getElementById("search-input")?.focus();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setSelectedIndex(-1);

    const newSuggestions: Suggestion[] = [];

    if (value) {
      if (value.toLowerCase().endsWith(".sol")) {
        const resolvedAddress = await resolveAddress(value);
        if (resolvedAddress) {
          newSuggestions.push({
            name: resolvedAddress,
            icon: <SearchIcon />,
            type: "Input",
          });
        }
      } else {
        // Check if the input is a Solana address or signature
        const isProgramAddress = isSolanaProgramAddress(value);
        const isAccountAddress = isSolanaAccountAddress(value);
        const isSignature = isSolanaSignature(value);

        if (isProgramAddress || isAccountAddress || isSignature) {
          newSuggestions.push({
            name: value,
            icon: <SearchIcon />,
            type: "Input",
          });
        } else {
          const programSuggestions = Object.entries(PROGRAM_INFO_BY_ID)
            .filter(([, { name, deployments }]) => {
              if (!deployments.includes(cluster)) return false;
              return name.toLowerCase().includes(value.toLowerCase());
            })
            .map(([address, { name }]) => ({
              name,
              icon: <CogIcon />,
              type: "Program",
              address,
            }));

          const tokenSuggestions = tokenList
            ? tokenList
                .filter((token) =>
                  token.name.toLowerCase().includes(value.toLowerCase()),
                )
                .map((token) => ({
                  name: token.name,
                  icon: token.logoURI ? (
                    <Image
                      loader={cloudflareLoader}
                      loading="eager"
                      src={token.logoURI}
                      alt={token.name}
                      width={48}
                      height={48}
                      className="h-6 w-6 rounded-full"
                      onError={(event: any) => {
                        event.target.id = "noimg";
                        event.target.srcset = noImg.src;
                      }}
                    />
                  ) : (
                    <Circle />
                  ),
                  type: "Token",
                  address: token.address,
                  logoURI: token.logoURI,
                }))
            : [];

          newSuggestions.push(...programSuggestions, ...tokenSuggestions);
        }
      }
    }

    setSuggestions(newSuggestions);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setSearch(suggestion.name);
    navigateToSuggestion(suggestion);
  };

  const navigateToSuggestion = (suggestion: Suggestion) => {
    setSuggestions([]);

    if (
      suggestion.type === "Program" ||
      suggestion.type === "Token" ||
      suggestion.type === "Account"
    ) {
      router.push(`/address/${suggestion.address}/?cluster=${cluster}`);
    } else if (suggestion.type === "Input") {
      if (isSolanaProgramAddress(suggestion.name)) {
        router.push(`/address/${suggestion.name}/?cluster=${cluster}`);
      } else if (isSolanaAccountAddress(suggestion.name)) {
        router.push(`/address/${suggestion.name}/?cluster=${cluster}`);
      } else if (isSolanaSignature(suggestion.name)) {
        router.push(`/tx/${suggestion.name}/?cluster=${cluster}`);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowDown") {
      setSelectedIndex((prevIndex) => {
        const nextIndex = Math.min(prevIndex + 1, suggestions.length - 1);
        setSearch(suggestions[nextIndex]?.name || search);
        return nextIndex;
      });
    } else if (e.key === "ArrowUp") {
      setSelectedIndex((prevIndex) => {
        const nextIndex = Math.max(prevIndex - 1, 0);
        setSearch(suggestions[nextIndex]?.name || search);
        return nextIndex;
      });
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        navigateToSuggestion(suggestions[selectedIndex]);
      } else {
        onFormSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
      }
    }

    if (suggestionsRef.current) {
      const currentItem = suggestionsRef.current.children[
        selectedIndex
      ] as HTMLLIElement;
      if (currentItem) {
        const container = suggestionsRef.current;
        const containerHeight = container.clientHeight;
        const itemHeight = currentItem.clientHeight;
        const itemTop = currentItem.offsetTop;
        const itemBottom = itemTop + itemHeight;

        if (itemBottom > container.scrollTop + containerHeight) {
          container.scrollTop = itemBottom - containerHeight;
        } else if (itemTop < container.scrollTop) {
          container.scrollTop = itemTop;
        }
      }
    }
  };

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!search) {
      return;
    }

    const selectedSuggestion = suggestions.find(
      (suggestion) => suggestion.name.toLowerCase() === search.toLowerCase(),
    );

    if (selectedSuggestion) {
      navigateToSuggestion(selectedSuggestion);
    } else {
      // Reverse lookup in program and token address lookup tables
      const programEntry = Object.entries(PROGRAM_INFO_BY_ID).find(
        ([, { name }]) => name.toLowerCase() === search.toLowerCase(),
      );

      const tokenEntry = tokenList
        ? tokenList.find(
            (token) => token.name.toLowerCase() === search.toLowerCase(),
          )
        : null;

      if (programEntry) {
        router.push(`/address/${programEntry[0]}/?cluster=${cluster}`);
        return;
      }

      if (tokenEntry) {
        router.push(`/address/${tokenEntry.address}/?cluster=${cluster}`);
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
    }
  };

  return (
    <div
      className="relative mx-auto w-full max-w-lg px-4 md:px-0"
      onKeyDown={handleKeyDown}
    >
      <form
        onSubmit={onFormSubmit}
        className="flex flex-col items-center space-y-4"
      >
        <div className="relative w-full">
          <Input
            id="search-input"
            startIcon={SearchIcon}
            type="search"
            placeholder="Search for accounts, transactions, programs, or tokens..."
            value={search}
            onChange={handleInputChange}
            className="h-12 w-full overflow-hidden"
            iconClassName="left-4"
            inputPaddingClassName="pl-12 pr-4"
            endiconclassname="right-6"
            autoComplete="off"
          />
          {suggestions.length > 0 && (
            <ul
              ref={suggestionsRef}
              className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-background shadow-lg"
            >
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className={`flex cursor-pointer items-center gap-2 p-2 hover:bg-secondary ${
                    index === selectedIndex ? "bg-secondary" : ""
                  }`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.icon}
                  {suggestion.type === "Input"
                    ? `Search for "${shortenLong(suggestion.name)}"`
                    : suggestion.name}
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
