"use client";

import * as React from "react";
import Image from "next/image";
import noImg from "@/../public/assets/noimg.svg";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Circle, CogIcon, SearchIcon } from "lucide-react";
import { useGetTokenListStrict } from "@/hooks/jupiterTokenList";
import { TldParser } from "@onsol/tldparser";
import { Connection } from "@solana/web3.js";
import debounce from "lodash/debounce";
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

export function CommandMenu({ ...props }: DialogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cluster, endpoint } = useCluster();
  const connection = new Connection(endpoint, "confirmed");

  const { data: tokenList } = useGetTokenListStrict();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<
    { name: string; icon: JSX.Element | string; type?: string; address?: string }[]
  >([]);
  const [cache, setCache] = React.useState<Map<string, any>>(new Map());

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
    if (search === "") {
      setSuggestions([]);
      return;
    }

    if (cache.has(search)) {
      setSuggestions(cache.get(search));
      return;
    }

    setLoading(true);

    const newSuggestions: { name: string; icon: JSX.Element | string; type?: string; address?: string }[] = [];

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
        icon: <CogIcon />,
        type: "Program",
        address,
      }));

    // Add token suggestions
    const tokenSuggestions = tokenList
      ? tokenList
          .filter((token) =>
            token.name.toLowerCase().includes(search.toLowerCase()),
          )
          .map((token) => ({
            name: token.name,
            icon: token.logoURI ? (
              <Image
                loader={cloudflareLoader}
                src={token.logoURI}
                alt={token.name}
                width={20}
                height={20}
                className="rounded-md"
                loading="eager"
                onError={(event: any) => {
                  event.target.id = "noimg";
                  event.target.src = noImg.src;
                }}
              />
            ) : (
              <Circle />
            ),
            type: "Token",
            address: token.address,
          }))
      : [];

    newSuggestions.push(...programSuggestions, ...tokenSuggestions);

    setSuggestions(newSuggestions);
    setCache((prevCache) => new Map(prevCache).set(search, newSuggestions));
    setLoading(false);
  }, 200);

  const handleSearchSelect = (suggestion: { name: string; icon: JSX.Element | string; type?: string; address?: string }) => {
    const pathname = `/address/${suggestion.address}/`;
    const nextQueryString = searchParams?.toString();

    router.push(`${pathname}${nextQueryString ? `?${nextQueryString}` : ''}`);
  };

  // Group suggestions by type
  const programSuggestions = suggestions.filter(
    (suggestion) => suggestion.type === "Program",
  );
  const accountSuggestions = suggestions.filter(
    (suggestion) => suggestion.type === "Account",
  );
  const transactionSuggestions = suggestions.filter(
    (suggestion) => suggestion.type === "Transaction",
  );
  const tokenSuggestions = suggestions.filter(
    (suggestion) => suggestion.type === "Token",
  );
  const domainSuggestions = suggestions.filter(
    (suggestion) => suggestion.type === "bonfida-domain" || suggestion.type === "ans-domain",
  );

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "relative h-12 w-full justify-start rounded-md bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 lg:w-[600px]",
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
          placeholder="Search for accounts and transactions..."
          onValueChange={handleOnValueChange}
        />
        <ScrollArea className="max-h-[300px]">
          <CommandList>
            {!loading && suggestions.length === 0 && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
            {loading && (
              <CommandLoading>
                <Loading className="pb-4" />
              </CommandLoading>
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
                      {suggestion.icon}
                      <span className="truncate">{suggestion.name}</span>
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
                      {suggestion.icon}
                      <span className="truncate">{suggestion.name}</span>
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
                    className="truncate"
                  >
                    <span className="flex items-center gap-2">
                      {suggestion.icon}
                      <span className="truncate">{suggestion.name}</span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {tokenSuggestions.length > 0 && (
              <CommandGroup heading="Token">
                {tokenSuggestions.map((suggestion, index) => (
                  <CommandItem
                    key={`token-${index}`}
                    value={suggestion.name}
                    onSelect={() => handleSearchSelect(suggestion)}
                  >
                    <span className="flex items-center gap-2">
                      {suggestion.icon}
                      <span className="truncate">{suggestion.name}</span>
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
                      {suggestion.icon}
                      <span className="truncate">{suggestion.name}</span>
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
