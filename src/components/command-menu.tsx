"use client";

import noImg from "@/../public/assets/noimg.svg";
import { useCluster } from "@/providers/cluster-provider";
import { Cluster } from "@/utils/cluster";
import {
  cn,
  isSolanaAccountAddress,
  isSolanaProgramAddress,
  isSolanaSignature,
} from "@/utils/common";
import { isBonfidaDomainAddress } from "@/utils/domain-info";
import cloudflareLoader from "@/utils/imageLoader";
import { PROGRAM_INFO_BY_ID } from "@/utils/programs";
import { TldParser, getAllTld } from "@onsol/tldparser";
import { DialogProps } from "@radix-ui/react-dialog";
import { Connection } from "@solana/web3.js";
import { useDebounce } from "@uidotdev/usehooks";
import { CommandLoading, Command as CommandPrimitive } from "cmdk";
import { ClockIcon, CogIcon, SearchIcon, X, XIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as React from "react";

import { useGetTokenListStrict } from "@/hooks/jupiterTokenList";
import useLocalStorage from "@/hooks/useLocalStorage";

import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";

import Loading from "./common/loading";

// Function to fetch suggestions
const fetchSuggestions = async (
  search: string,
  connection: Connection,
  tokenList: any[],
  cluster: Cluster,
  allTlds: string[],
) => {
  const newSuggestions: {
    name: string;
    icon: JSX.Element | string;
    type?: string;
    address?: string;
    symbol?: string;
  }[] = [];

  // Helper function to push suggestions
  const pushSuggestion = (
    name: string,
    icon: JSX.Element | string,
    type: string,
    address: string,
    symbol?: string,
  ) => {
    newSuggestions.push({ name, icon, type, address, symbol });
  };

  // Check for both domain patterns simultaneously
  const domainChecks = async () => {
    const solDomainPattern = /\.sol$/i;
    const domainPattern = new RegExp(`(${allTlds.join("|")})$`, "i");

    const promises = [];

    if (solDomainPattern.test(search)) {
      promises.push(
        isBonfidaDomainAddress(search, connection)
          .then(async (isBonfida) => {
            if (isBonfida) {
              const response = await fetch(
                `https://sns-sdk-proxy.bonfida.workers.dev/resolve/${search.toLowerCase()}`,
              );
              const { result = "" } = await response.json();
              if (result) {
                pushSuggestion(
                  search,
                  <SearchIcon />,
                  "bonfida-domain",
                  result,
                );
              }
            }
          })
          .catch(() => {}),
      );
    }

    if (domainPattern.test(search)) {
      promises.push(
        (async () => {
          try {
            const ans = new TldParser(connection);
            const owner = await ans.getOwnerFromDomainTld(search);
            if (owner) {
              pushSuggestion(
                search,
                <SearchIcon />,
                "ans-domain",
                owner.toBase58(),
              );
            }
          } catch (error) {
            console.error("Error fetching domain owner:", error);
          }
        })(),
      );
    }

    await Promise.all(promises);
  };

  await domainChecks();

  // Check if is program address
  if (isSolanaProgramAddress(search)) {
    pushSuggestion(search, <SearchIcon />, "Program", search);
  }

  // Check if address and not program address
  if (isSolanaAccountAddress(search) && !isSolanaProgramAddress(search)) {
    pushSuggestion(search, <SearchIcon />, "Account", search);
  }

  // Check if is transaction id
  if (isSolanaSignature(search)) {
    pushSuggestion(search, <SearchIcon />, "Transaction", search);
  }

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
          `${token.name} (${token.symbol})`
            .toLowerCase()
            .includes(search.toLowerCase()),
        )
        .map((token) => ({
          name: token.name,
          icon: (
            <Image
              loader={cloudflareLoader}
              src={token.logoURI || noImg.src}
              alt={token.name}
              width={40}
              height={40}
              className="rounded-full"
              loading="eager"
              onError={(event: any) => {
                event.target.id = "noImg";
                event.target.srcset = noImg.src;
              }}
            />
          ),
          type: "Token",
          address: token.address,
          symbol: token.symbol,
        }))
        .sort(
          (a, b) =>
            a.name.localeCompare(b.name) || a.symbol.localeCompare(b.symbol),
        )
    : [];

  newSuggestions.push(...programSuggestions, ...tokenSuggestions);

  return newSuggestions;
};

export function CommandMenu({ ...props }: DialogProps) {
  const router = useRouter();
  const { cluster, endpoint } = useCluster();
  const connection = React.useMemo(
    () => new Connection(endpoint, "confirmed"),
    [endpoint],
  );
  const [allTlds, setAllTlds] = React.useState<string[]>([]);

  const { data: tokenList } = useGetTokenListStrict();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<
    {
      name: string;
      icon: JSX.Element | string;
      type?: string;
      address?: string;
      symbol?: string;
    }[]
  >([]);
  const [cache, setCache] = React.useState<Map<string, any>>(new Map());
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const [recentSearches, setRecentSearches] = useLocalStorage<
    {
      name: string;
      symbol?: string;
      icon: JSX.Element | string;
      address: string;
    }[]
  >("recentSearches", []);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = React.useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(search, 300);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (!input) {
        return;
      }

      // Keep the options displayed when the user is typing
      if (!open) {
        setOpen(true);
      }

      if (event.key === "Escape") {
        input.blur();
      }
    },
    [open],
  );

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
        const input = inputRef.current;
        if (!input) {
          return;
        }

        input.focus();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    const fetchAllTlds = async () => {
      const tlds = await getAllTld(connection);
      setAllTlds(tlds.map((tld) => tld.tld.toString()));
    };

    fetchAllTlds();
  }, [connection]);

  React.useEffect(() => {
    const fetchData = async () => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo(0, 0);
      }

      if (debouncedSearch === "") {
        if (suggestions.length > 0) setSuggestions([]);
        setLoading(false);
        return;
      }

      if (cache.has(debouncedSearch)) {
        setSuggestions(cache.get(debouncedSearch));
        setLoading(false);
        return;
      }

      setLoading(true);

      const newSuggestions = await fetchSuggestions(
        debouncedSearch,
        connection,
        tokenList || [],
        cluster as Cluster,
        allTlds,
      );

      setSuggestions(newSuggestions);
      setCache((prevCache) =>
        new Map(prevCache).set(debouncedSearch, newSuggestions),
      );
      setLoading(false);
    };

    fetchData();
  }, [
    debouncedSearch,
    connection,
    tokenList,
    cluster,
    cache,
    suggestions.length,
    allTlds,
  ]);

  const handleSearchSelect = React.useCallback(
    (suggestion: {
      name: string;
      icon: JSX.Element | string;
      type?: string;
      address?: string;
      symbol?: string;
    }) => {
      const newPathname =
        suggestion.type === "Transaction"
          ? `/tx/${suggestion.address}/?cluster=${cluster}`
          : `/address/${suggestion.address}/?cluster=${cluster}`;

      setIsSearching(true);
      router.push(newPathname);

      // Update recent searches
      setRecentSearches((prevSearches) => {
        const newSearch = {
          name: suggestion.name,
          symbol: suggestion.symbol,
          icon: suggestion.icon,
          address: suggestion.address!,
        };
        const newSearches = [
          newSearch,
          ...prevSearches.filter((item) => item.address !== newSearch.address),
        ];
        return newSearches.slice(0, 5); // Limit to 5 recent searches
      });
    },
    [router, cluster, setRecentSearches],
  );

  React.useEffect(() => {
    if (isSearching) {
      setIsSearching(false);
    }
  }, [isSearching, pathname, searchParams]);

  const handleOnValueChange = (value: string) => {
    setSearch(value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setIsSearching(true);
    }
  };

  const clearRecentSearch = (search: {
    name: string;
    symbol?: string;
    icon: JSX.Element | string;
    address: string;
  }) => {
    setRecentSearches((prevSearches) =>
      prevSearches.filter((item) => item.address !== search.address),
    );
  };

  const clearAllRecentSearches = () => {
    setRecentSearches([]);
  };

  const handleBlur = React.useCallback(() => {
    setTimeout(() => {
      setOpen(false);
      setInputValue(search);
    }, 0);
  }, [search]);

  const handleFocus = React.useCallback(() => {
    setOpen(true);
  }, []);

  const handleSelectOption = React.useCallback(
    (selectedOption: {
      name: string;
      icon: JSX.Element | string;
      type?: string;
      address?: string;
      symbol?: string;
    }) => {
      setSearch(selectedOption.name);
      handleSearchSelect(selectedOption);

      // This is a hack to prevent the input from being focused after the user selects an option
      // We can call this hack: "The next tick"
      setTimeout(() => {
        inputRef?.current?.blur();
      }, 0);
    },
    [handleSearchSelect],
  );

  // Event listener for command key
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

  // Group suggestions by type
  const tokenSuggestions = suggestions.filter(
    (suggestion) => suggestion.type === "Token",
  );
  const accountSuggestions = suggestions.filter(
    (suggestion) => suggestion.type === "Account",
  );
  const transactionSuggestions = suggestions.filter(
    (suggestion) => suggestion.type === "Transaction",
  );
  const programSuggestions = suggestions.filter(
    (suggestion) => suggestion.type === "Program",
  );
  const domainSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.type === "bonfida-domain" || suggestion.type === "ans-domain",
  );

  return (
    <CommandPrimitive onKeyDown={handleKeyDown}>
      <div
        className={cn(
          "relative mx-6 inline-flex h-12 w-full min-w-[300px] items-center justify-center whitespace-nowrap rounded-lg border border-input px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-popover hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sm:pr-12 lg:mx-0 lg:min-w-[500px]",
          open ? "rounded-none rounded-t-lg bg-popover" : "bg-background",
        )}
      >
        <CommandInput
          placeholder="Search for accounts, transactions, tokens and programs..."
          onValueChange={handleOnValueChange}
          value={search}
          ref={inputRef}
          onBlur={handleBlur}
          onFocus={handleFocus}
          withShortcut
          onKeyPress={handleKeyPress}
        />
        <button
          className={cn(
            "absolute right-[3rem] top-[0.70rem] select-none items-center justify-center rounded px-1.5",
            inputValue && inputValue.length > 0 ? "flex" : "hidden",
          )}
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onClick={() => {
            handleOnValueChange("");
          }}
        >
          <X className="h-6 w-6" />
        </button>
        <div
          className={cn(
            "pointer-events-none absolute right-[1rem] top-[0.70rem] hidden h-6 w-6 select-none items-center justify-center rounded border bg-muted px-1.5 font-mono text-[14px] font-medium opacity-80 sm:flex",
          )}
        >
          {"/"}
        </div>
      </div>
      <div className="relative">
        <div
          className={cn(
            "absolute top-0 z-10 w-full overflow-hidden rounded-b-lg border border-t-0 border-input bg-popover",
            open ? "block" : "hidden",
          )}
        >
          <ScrollArea className="max-h-[300px]" ref={scrollAreaRef}>
            <CommandList>
              {loading && (
                <CommandLoading>
                  <Loading className="mt-4 pb-4" />
                </CommandLoading>
              )}
              {!loading && suggestions.length === 0 && (
                <>
                  <CommandEmpty>No results found.</CommandEmpty>
                  {recentSearches.length > 0 && (
                    <CommandGroup heading="Recent Searches">
                      {recentSearches.map((search, index) => (
                        <CommandItem
                          key={`recent-${index}`}
                          value={search.name}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                          }}
                          onSelect={() =>
                            router.push(
                              `/address/${search.address}/?cluster=${cluster}`,
                            )
                          }
                        >
                          <div className="flex w-full items-center gap-2">
                            <ClockIcon className="h-5 w-5 text-muted-foreground" />
                            <span className="truncate md:flex-grow">
                              {search.name}
                            </span>
                            <button
                              className="p-2 md:ml-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                clearRecentSearch(search);
                              }}
                            >
                              <XIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </CommandItem>
                      ))}
                      <CommandItem
                        key="clear-all-recent"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                        onSelect={clearAllRecentSearches}
                        className="h-10 text-red-500"
                      >
                        Clear All
                      </CommandItem>
                    </CommandGroup>
                  )}
                </>
              )}
              {tokenSuggestions.length > 0 && (
                <CommandGroup heading="Token">
                  {tokenSuggestions.map((suggestion, index) => (
                    <CommandItem
                      key={`token-${index}`}
                      value={`${suggestion.name} (${suggestion.symbol})`}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onSelect={() => handleSelectOption(suggestion)}
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
                            <span className="truncate text-xs text-muted-foreground">
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
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onSelect={() => handleSelectOption(suggestion)}
                    >
                      <span className="flex items-center gap-2">
                        <span className="flex-shrink-0">{suggestion.icon}</span>
                        <span className="flex flex-col">
                          <span className="flex items-center gap-1">
                            <span className="truncate">{suggestion.name}</span>
                          </span>
                          {suggestion.address && (
                            <span className="truncate text-xs text-muted-foreground">
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
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onSelect={() => handleSelectOption(suggestion)}
                    >
                      <span className="flex items-center gap-2">
                        <span className="flex-shrink-0">{suggestion.icon}</span>
                        <span className="flex flex-col">
                          <span className="flex items-center gap-1">
                            <span className="truncate">{suggestion.name}</span>
                          </span>
                          {suggestion.address && (
                            <span className="truncate text-xs text-muted-foreground">
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
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onSelect={() => handleSelectOption(suggestion)}
                    >
                      <span className="flex items-center gap-2">
                        <span className="flex-shrink-0">{suggestion.icon}</span>
                        <span className="flex flex-col">
                          <span className="flex items-center gap-1">
                            <span className="truncate">{suggestion.name}</span>
                          </span>
                          {suggestion.address && (
                            <span className="truncate text-xs text-muted-foreground">
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
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onSelect={() => handleSelectOption(suggestion)}
                    >
                      <span className="flex items-center gap-2">
                        <span className="flex-shrink-0">{suggestion.icon}</span>
                        <span className="flex flex-col">
                          <span className="flex items-center gap-1">
                            <span className="truncate">{suggestion.name}</span>
                          </span>
                          {suggestion.address && (
                            <span className="truncate text-xs text-muted-foreground">
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
        </div>
      </div>
    </CommandPrimitive>
  );
}
