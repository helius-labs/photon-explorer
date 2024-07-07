"use client";

import * as React from "react";
import { useCluster } from "@/providers/cluster-provider";
import { useRouter } from "next/navigation";
import { Connection } from "@solana/web3.js";
import { debounce } from "lodash";

import noImg from "@/../public/assets/noimg.svg";
import Image from "next/image";
import cloudflareLoader from "@/utils/imageLoader";
import { useGetTokenListStrict } from "@/hooks/jupiterTokenList";
import {
  isSolanaAccountAddress,
  isSolanaProgramAddress,
  isSolanaSignature,
  shortenLong,
} from "@/utils/common";
import { PROGRAM_INFO_BY_ID } from "@/utils/programs";
import { getDomainInfo, hasDomainSyntax } from "@/utils/domain-info";

import { Circle, CogIcon, SearchIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Suggestion {
  name: string;
  icon: JSX.Element;
  type: string;
  address?: string;
  logoURI?: string;
}

export function Search() {
  const router = useRouter();
  const { cluster, endpoint } = useCluster();
  const [search, setSearch] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = React.useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = React.useState<number>(-1);
  const [noResults, setNoResults] = React.useState<boolean>(false);
  const [activeFilter, setActiveFilter] = React.useState<string>("All");

  const { data: tokenList } = useGetTokenListStrict();
  const suggestionsRef = React.useRef<HTMLUListElement>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetchSuggestions = React.useCallback(
    debounce(async (value: string) => {
      const connection = new Connection(endpoint, "confirmed");
      const newSuggestions: Suggestion[] = [];

      if (value) {
        if (hasDomainSyntax(value)) {
          const domainInfo = await getDomainInfo(value, connection);
          if (domainInfo) {
            newSuggestions.push({
              name: domainInfo.name,
              icon: <SearchIcon />,
              type: "Domain",
              address: domainInfo.owner,
            });
          }
        } else {
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
              .filter(([, { name, deployments }]) => deployments.includes(cluster) && name.toLowerCase().includes(value.toLowerCase()))
              .map(([address, { name }]) => ({
                name,
                icon: <CogIcon />,
                type: "Program",
                address,
              }));

            const tokenSuggestions = tokenList
              ? tokenList
                  .filter((token) => token.name.toLowerCase().includes(value.toLowerCase()))
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
      setNoResults(value !== "" && newSuggestions.length === 0);
      filterSuggestions(newSuggestions, activeFilter);
    }, 300),
    [cluster, endpoint, tokenList, activeFilter]
  );

  const filterSuggestions = (suggestions: Suggestion[], filter: string) => {
    let filtered;
    if (filter === "All") {
      filtered = suggestions;
    } else {
      filtered = suggestions.filter((suggestion) => suggestion.type === filter);
    }
    setFilteredSuggestions(filtered);
    setNoResults(search !== "" && filtered.length === 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setSelectedIndex(-1);
    debouncedFetchSuggestions(value);
  };

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    filterSuggestions(suggestions, filter);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setSearch(suggestion.name);
    navigateToSuggestion(suggestion);
  };

  const navigateToSuggestion = (suggestion: Suggestion) => {
    setSuggestions([]);
    setFilteredSuggestions([]);

    if (
      suggestion.type === "Program" ||
      suggestion.type === "Token" ||
      suggestion.type === "Account" ||
      suggestion.type === "Domain"
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
        const nextIndex = Math.min(prevIndex + 1, filteredSuggestions.length - 1);
        setSearch(filteredSuggestions[nextIndex]?.name || search);
        return nextIndex;
      });
    } else if (e.key === "ArrowUp") {
      setSelectedIndex((prevIndex) => {
        const nextIndex = Math.max(prevIndex - 1, 0);
        setSearch(filteredSuggestions[nextIndex]?.name || search);
        return nextIndex;
      });
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
        navigateToSuggestion(filteredSuggestions[selectedIndex]);
      } else {
        onFormSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
      }
    }

    if (suggestionsRef.current) {
      const currentItem = suggestionsRef.current.children[selectedIndex] as HTMLLIElement;
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
      (suggestion) => suggestion.name.toLowerCase() === search.toLowerCase()
    );

    if (selectedSuggestion) {
      navigateToSuggestion(selectedSuggestion);
    } else {
      const programEntry = Object.entries(PROGRAM_INFO_BY_ID).find(
        ([, { name }]) => name.toLowerCase() === search.toLowerCase()
      );

      const tokenEntry = tokenList
        ? tokenList.find((token) => token.name.toLowerCase() === search.toLowerCase())
        : null;

      if (programEntry) {
        router.push(`/address/${programEntry[0]}/?cluster=${cluster}`);
        return;
      }

      if (tokenEntry) {
        router.push(`/address/${tokenEntry.address}/?cluster=${cluster}`);
        return;
      }

      if (isSolanaProgramAddress(search)) {
        router.push(`/address/${search}/?cluster=${cluster}`);
        return;
      }

      if (isSolanaAccountAddress(search)) {
        router.push(`/address/${search}/?cluster=${cluster}`);
        return;
      }

      if (isSolanaSignature(search)) {
        router.push(`/tx/${search}/?cluster=${cluster}`);
        return;
      }

      // Show no results message
      setNoResults(true);
    }
  };

  const filterCounts = {
    all: suggestions.length,
    token: suggestions.filter((s) => s.type === "Token").length,
    program: suggestions.filter((s) => s.type === "Program").length,
    domain: suggestions.filter((s) => s.type === "Domain").length,
    account: suggestions.filter((s) => s.type === "Account").length,
  };

  return (
    <div className="relative mx-auto w-full max-w-lg px-4 md:px-0" onKeyDown={handleKeyDown}>
      <form onSubmit={onFormSubmit} className="flex flex-col items-center space-y-4">
        <div className="relative w-full flex items-center">
          <button
            type="button"
            className={`absolute left-2 top-1/2 transform -translate-y-1/2 ${search ? "visible" : "invisible"}`}
            onClick={() => setSearch("")}
          >
            <XIcon className="h-4 w-4 text-muted-foreground" />
          </button>
          <Input
            id="search-input"
            startIcon={SearchIcon}
            type="search"
            placeholder="Search for accounts, transactions, programs, or tokens..."
            value={search}
            onChange={handleInputChange}
            className="h-12 w-full overflow-hidden pl-10"
            iconClassName="left-4"
            inputPaddingClassName="pl-12 pr-4"
            autoComplete="off"
          />
        </div>
        {suggestions.length > 0 && (
          <div className="w-full">
            <div className="flex flex-wrap justify-center space-x-2 mb-2">
              <div className="hidden sm:flex">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => handleFilterClick("All")}
                  className={activeFilter === "All" ? "bg-secondary" : ""}
                >
                  All ({filterCounts.all})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => handleFilterClick("Token")}
                  className={activeFilter === "Token" ? "bg-secondary" : ""}
                >
                  Tokens ({filterCounts.token})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => handleFilterClick("Program")}
                  className={activeFilter === "Program" ? "bg-secondary" : ""}
                >
                  Programs ({filterCounts.program})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => handleFilterClick("Domain")}
                  className={activeFilter === "Domain" ? "bg-secondary" : ""}
                >
                  Domains ({filterCounts.domain})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => handleFilterClick("Account")}
                  className={activeFilter === "Account" ? "bg-secondary" : ""}
                >
                  Wallets ({filterCounts.account})
                </Button>
              </div>
              <div className="flex sm:hidden">
                {filterCounts.all > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => handleFilterClick("All")}
                    className={activeFilter === "All" ? "bg-secondary" : ""}
                  >
                    All ({filterCounts.all})
                  </Button>
                )}
                {filterCounts.token > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => handleFilterClick("Token")}
                    className={activeFilter === "Token" ? "bg-secondary" : ""}
                  >
                    Tokens ({filterCounts.token})
                  </Button>
                )}
                {filterCounts.program > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => handleFilterClick("Program")}
                    className={activeFilter === "Program" ? "bg-secondary" : ""}
                  >
                    Programs ({filterCounts.program})
                  </Button>
                )}
                {filterCounts.domain > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => handleFilterClick("Domain")}
                    className={activeFilter === "Domain" ? "bg-secondary" : ""}
                  >
                    Domains ({filterCounts.domain})
                  </Button>
                )}
                {filterCounts.account > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => handleFilterClick("Account")}
                    className={activeFilter === "Account" ? "bg-secondary" : ""}
                  >
                    Wallets ({filterCounts.account})
                  </Button>
                )}
              </div>
            </div>
            <ul ref={suggestionsRef} className="mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-background shadow-lg">
              {filteredSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className={`flex cursor-pointer items-center gap-2 p-2 hover:bg-secondary ${index === selectedIndex ? "bg-secondary" : ""}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.icon}
                  <div className="flex flex-col">
                    <span>{suggestion.name}</span>
                    {suggestion.address && <span className="text-xs text-muted-foreground">{shortenLong(suggestion.address)}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Button type="submit" variant="outline" disabled={!search}>
          Search
        </Button>
        {noResults && search !== "" && filteredSuggestions.length === 0 && (
          <div className="w-full text-center text-sm text-muted-foreground">
            No results found.
          </div>
        )}
      </form>
    </div>
  );
}
