"use client";

import * as React from "react";
import Image from "next/image";
import noImg from "@/../public/assets/noimg.svg";
import { useRouter } from "next/navigation";
import { useCluster } from "@/providers/cluster-provider";
import {
  cn,
  isSolanaAccountAddress,
  isSolanaProgramAddress,
  isSolanaSignature,
  isBonfidaDomainAddress,
  isAlternativeDomainAddress,
} from "@/utils/common";
import cloudflareLoader from "@/utils/imageLoader";
import { PROGRAM_INFO_BY_ID } from "@/utils/programs";
import { DialogProps } from "@radix-ui/react-dialog";
import { CommandLoading } from "cmdk";
import { CogIcon, SearchIcon } from "lucide-react";
import { useGetTokenListStrict } from "@/hooks/jupiterTokenList";
import { TldParser } from "@onsol/tldparser";
import { Connection } from "@solana/web3.js";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import Loading from "./common/loading";
import { debounce } from "lodash";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Separator } from "./ui/separator";

export function CommandMenu({ ...props }: DialogProps) {
  const router = useRouter();
  const { cluster, endpoint } = useCluster();
  const connection = new Connection(endpoint, "confirmed");

  const { data: tokenList } = useGetTokenListStrict();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<
    { name: string; icon: JSX.Element | string; type?: string; address?: string; symbol?: string }[]
  >([]);
  const [cache, setCache] = React.useState<Map<string, any>>(new Map());
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>("recentSearches", []);

  const searchButtonRef = React.useRef<HTMLButtonElement>(null);

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
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleOnValueChange = debounce(async (search: string) => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo(0, 0);
    }

    if (search === "") {
      setSuggestions([]);
      return;
    }

    if (cache.has(search)) {
      setSuggestions(cache.get(search));
      return;
    }

    setLoading(true);

    const newSuggestions: { name: string; icon: JSX.Element | string; type?: string; address?: string; symbol?: string }[] = [];

    // Check if is program address
    if (isSolanaProgramAddress(search)) {
      newSuggestions.push({
        name: search,
        icon: <SearchIcon />,
        type: "Program",
        address: search,
      });
    }

    // Check if address and not program address
    if (isSolanaAccountAddress(search) && !isSolanaProgramAddress(search)) {
      newSuggestions.push({
        name: search,
        icon: <SearchIcon />,
        type: "Account",
        address: search,
      });
    }

    // Check if is transaction id
    if (isSolanaSignature(search)) {
      newSuggestions.push({
        name: search,
        icon: <SearchIcon />,
        type: "Transaction",
        address: search,
      });
    }

    // Perform domain checks in parallel
    const [bonfidaDomain, ansDomain] = await Promise.all([
      (async () => {
        if (await isBonfidaDomainAddress(search, connection)) {
          const response = await fetch(
            `https://sns-sdk-proxy.bonfida.workers.dev/resolve/${search.toLowerCase()}`
          );
          const { result = "" } = await response.json();
          if (result) {
            return {
              name: search,
              icon: <SearchIcon />,
              type: "bonfida-domain",
              address: result,
            };
          }
        }
        return null;
      })(),
      (async () => {
        if (await isAlternativeDomainAddress(search, connection)) {
          const ans = new TldParser(connection);
          const owner = await ans.getOwnerFromDomainTld(search);
          if (owner) {
            return {
              name: search,
              icon: <SearchIcon />,
              type: "ans-domain",
              address: owner.toBase58(),
            };
          }
        }
        return null;
      })(),
    ]);

    if (bonfidaDomain) newSuggestions.push(bonfidaDomain);
    if (ansDomain) newSuggestions.push(ansDomain);

    // Add program suggestions
    const programSuggestions = Object.entries(PROGRAM_INFO_BY_ID)
      .filter(([, { name, deployments }]) => {
        if (!deployments.includes(cluster)) return false;
        return name.toLowerCase().includes(search.toLowerCase());
      })
      .map(([address, { name }]) => ({
        name,
        icon: <CogIcon width={30} height={30} />,
        type: "Program",
        address,
      }));

    // Add token suggestions
    const tokenSuggestions = tokenList
      ? tokenList
          .filter((token) =>
            token.symbol.toLowerCase().includes(search.toLowerCase()) || token.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((token) => ({
            name: token.name,
            icon: (
              <Image
                loader={cloudflareLoader}
                src={token.logoURI || noImg.src}
                alt={token.name}
                width={30}
                height={30}
                className="rounded-md"
                loading="eager"
                onError={(event: any) => {
                  event.target.id = "noimg";
                  event.target.srcset = noImg.src;
                }}
              />
            ),
            type: "Token",
            address: token.address,
            symbol: token.symbol,
          }))
          .sort((a, b) => {
            const searchLower = search.toLowerCase();

            // Exact symbol match
            const aSymbolExactMatch = a.symbol?.toLowerCase() === searchLower;
            const bSymbolExactMatch = b.symbol?.toLowerCase() === searchLower;
            if (aSymbolExactMatch && !bSymbolExactMatch) return -1;
            if (!aSymbolExactMatch && bSymbolExactMatch) return 1;

            // Exact name match
            const aNameExactMatch = a.name.toLowerCase() === searchLower;
            const bNameExactMatch = b.name.toLowerCase() === searchLower;
            if (aNameExactMatch && !bNameExactMatch) return -1;
            if (!aNameExactMatch && bNameExactMatch) return 1;

            // Partial symbol match
            const aSymbolPartialMatch = a.symbol?.toLowerCase().includes(searchLower);
            const bSymbolPartialMatch = b.symbol?.toLowerCase().includes(searchLower);
            if (aSymbolPartialMatch && !bSymbolPartialMatch) return -1;
            if (!aSymbolPartialMatch && bSymbolPartialMatch) return 1;

            // Partial name match
            const aNamePartialMatch = a.name.toLowerCase().includes(searchLower);
            const bNamePartialMatch = b.name.toLowerCase().includes(searchLower);
            if (aNamePartialMatch && !bNamePartialMatch) return -1;
            if (!aNamePartialMatch && bNamePartialMatch) return 1;

            // Default alphabetical sorting by name
            return a.name.localeCompare(b.name);
          })
      : [];

    newSuggestions.push(...programSuggestions, ...tokenSuggestions);

    setSuggestions(newSuggestions);
    setCache((prevCache) => new Map(prevCache).set(search, newSuggestions));
    setLoading(false);
  }, 100);

  React.useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo(0, 0);
    }
  }, [suggestions]);

  const handleSearchSelect = (suggestion: { name: string; icon: JSX.Element | string; type?: string; address?: string; symbol?: string }) => {
    const pathname = `/address/${suggestion.address}/`;
    router.push(pathname);

    // Update recent searches
    setRecentSearches((prevSearches) => {
      const newSearch = suggestion.symbol || suggestion.name;
      const newSearches = [newSearch, ...prevSearches.filter((item) => item !== newSearch)];
      return newSearches.slice(0, 5); // Limit to 5 recent searches
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  // Group suggestions by type
  const tokenSuggestions = suggestions.filter(
    (suggestion) => suggestion.type === "Token"
  );
  const accountSuggestions = suggestions.filter(
    (suggestion) => suggestion.type === "Account"
  );
  const transactionSuggestions = suggestions.filter(
    (suggestion) => suggestion.type === "Transaction"
  );
  const programSuggestions = suggestions.filter(
    (suggestion) => suggestion.type === "Program"
  );
  const domainSuggestions = suggestions.filter(
    (suggestion) => suggestion.type === "bonfida-domain" || suggestion.type === "ans-domain"
  );

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "relative h-12 w-full justify-start rounded-md bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 lg:w-[600px]"
        )}
        onClick={() => setOpen(true)}
        ref={searchButtonRef}
        {...props}
      >
        <SearchIcon 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground"
        />
        <span className="hidden lg:inline-flex lg:ml-8">
          Search for accounts, transactions, tokens and programs...
        </span>
        <span className="pl-6 inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-[1rem] top-[0.70rem] hidden h-6 w-6 select-none items-center justify-center rounded border bg-muted px-1.5 font-mono text-[14px] font-medium opacity-80 sm:flex">
          {"/"}
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} triggerRef={searchButtonRef}>
        <CommandInput
          placeholder="Search for accounts, transactions, tokens and programs..."
          onValueChange={handleOnValueChange}
          withShortcut
        />
        <Separator />
        <ScrollArea className="max-h-[300px]" ref={scrollAreaRef}>
          <CommandList>
            {!loading && suggestions.length === 0 && (
              <>
                <CommandEmpty>No results found.</CommandEmpty>
                {recentSearches.length > 0 && (
                  <CommandGroup heading="Recent Searches">
                    {recentSearches.map((search, index) => (
                      <CommandItem
                        key={`recent-${index}`}
                        value={search}
                        onSelect={() => handleOnValueChange(search)}
                      >
                        {search}
                      </CommandItem>
                    ))}
                    <CommandItem
                      key="clear-recent"
                      onSelect={clearRecentSearches}
                      className="text-red-500"
                    >
                      Clear Recent Searches
                    </CommandItem>
                  </CommandGroup>
                )}
              </>
            )}
            {loading && (
              <CommandLoading>
                <Loading className="pb-4" />
              </CommandLoading>
            )}
            {tokenSuggestions.length > 0 && (
              <CommandGroup heading="Token">
                {tokenSuggestions.map((suggestion, index) => (
                  <CommandItem
                    key={`token-${index}`}
                    value={suggestion.symbol || suggestion.name}
                    onSelect={() => handleSearchSelect(suggestion)}
                  >
                    <span className="flex items-center gap-2">
                      <span className="flex-shrink-0">{suggestion.icon}</span>
                      <span className="flex flex-col">
                        <span className="flex items-center gap-1">
                          <span className="truncate">{suggestion.name}</span>
                          {suggestion.symbol && (
                            <span className="text-xs text-muted-foreground">
                              ({suggestion.symbol})
                            </span>
                          )}
                        </span>
                        {suggestion.address && (
                          <span className="text-xs text-muted-foreground truncate">
                            {suggestion.address}
                          </span>
                        )}
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {accountSuggestions.length > 0 && (
              <CommandGroup heading="Account">
                {accountSuggestions.map((suggestion, index) => (
                  <CommandItem
                    key={`account-${index}`}
                    value={suggestion.name}
                    onSelect={() => handleSearchSelect(suggestion)}
                  >
                    <span className="flex items-center gap-2">
                      <span className="flex-shrink-0">{suggestion.icon}</span>
                      <span className="flex flex-col">
                        <span className="flex items-center gap-1">
                          <span className="truncate">{suggestion.name}</span>
                        </span>
                        {suggestion.address && (
                          <span className="text-xs text-muted-foreground truncate">
                            {suggestion.address}
                          </span>
                        )}
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {transactionSuggestions.length > 0 && (
              <CommandGroup heading="Transaction">
                {transactionSuggestions.map((suggestion, index) => (
                  <CommandItem
                    key={`transaction-${index}`}
                    value={suggestion.name}
                    onSelect={() => handleSearchSelect(suggestion)}
                  >
                    <span className="flex items-center gap-2">
                      <span className="flex-shrink-0">{suggestion.icon}</span>
                      <span className="flex flex-col">
                        <span className="flex items-center gap-1">
                          <span className="truncate">{suggestion.name}</span>
                        </span>
                        {suggestion.address && (
                          <span className="text-xs text-muted-foreground truncate">
                            {suggestion.address}
                          </span>
                        )}
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {programSuggestions.length > 0 && (
              <CommandGroup heading="Program">
                {programSuggestions.map((suggestion, index) => (
                  <CommandItem
                    key={`program-${index}`}
                    value={suggestion.name}
                    onSelect={() => handleSearchSelect(suggestion)}
                  >
                    <span className="flex items-center gap-2">
                      <span className="flex-shrink-0">{suggestion.icon}</span>
                      <span className="flex flex-col">
                        <span className="flex items-center gap-1">
                          <span className="truncate">{suggestion.name}</span>
                        </span>
                        {suggestion.address && (
                          <span className="text-xs text-muted-foreground truncate">
                            {suggestion.address}
                          </span>
                        )}
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {domainSuggestions.length > 0 && (
              <CommandGroup heading="Domain">
                {domainSuggestions.map((suggestion, index) => (
                  <CommandItem
                    key={`domain-${index}`}
                    value={suggestion.name}
                    onSelect={() => handleSearchSelect(suggestion)}
                  >
                    <span className="flex items-center gap-2">
                      <span className="flex-shrink-0">{suggestion.icon}</span>
                      <span className="flex flex-col">
                        <span className="flex items-center gap-1">
                          <span className="truncate">{suggestion.name}</span>
                        </span>
                        {suggestion.address && (
                          <span className="text-xs text-muted-foreground truncate">
                            {suggestion.address}
                          </span>
                        )}
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </ScrollArea>
      </CommandDialog>
    </>
  );
}
