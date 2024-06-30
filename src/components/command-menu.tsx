"use client";

import { useCluster } from "@/providers/cluster-provider";
import { DialogProps } from "@radix-ui/react-dialog";
import { CommandLoading } from "cmdk";
import { useRouter } from "next/navigation";
import * as React from "react";

import {
  cn,
  isSolanaAccountAddress,
  isSolanaProgramAddress,
  isSolanaSignature,
} from "@/utils/common";

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

import { PROGRAM_INFO_BY_ID } from "@/utils/programs";
import { useGetTokenListStrict } from "@/hooks/jupiterTokenList";
import Image from "next/image";
import { Circle, CogIcon, SearchIcon } from "lucide-react";

export function CommandMenu({ ...props }: DialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [program, setProgram] = React.useState<string | null>(null);
  const [transaction, setTransaction] = React.useState<string | null>(null);
  const [address, setAddress] = React.useState<string | null>(null);
  const [suggestions, setSuggestions] = React.useState<{ name: string; icon: JSX.Element; type?: string; address?: string }[]>([]);
  const { cluster } = useCluster();

  const { data: tokenList, isLoading: tokenListLoading } = useGetTokenListStrict();

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

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  const handleOnValueChange = (search: string) => {
    if (search === "") {
      setSuggestions([]);
      return;
    }

    async function check() {
      setLoading(true);

      setProgram(null);
      setAddress(null);
      setTransaction(null);

      const newSuggestions = [];

      // Check if is program address
      if (isSolanaProgramAddress(search)) {
        setProgram(search);
        newSuggestions.push({ name: search, icon: <SearchIcon />, type: 'Program', address: search });
      }

      // Check if address and not program address
      if (isSolanaAccountAddress(search) && !isSolanaProgramAddress(search)) {
        setAddress(search);
        newSuggestions.push({ name: search, icon: <SearchIcon />, type: 'Account', address: search });
      }

      // Check if is transaction id
      if (isSolanaSignature(search)) {
        setTransaction(search);
        newSuggestions.push({ name: search, icon: <SearchIcon />, type: 'Transaction', address: search });
      }

      // Add program suggestions
      const programSuggestions = Object.entries(PROGRAM_INFO_BY_ID)
        .filter(([, { name, deployments }]) => {
          if (!deployments.includes(cluster)) return false;
          return (
            name.toLowerCase().includes(search.toLowerCase())
          );
        })
        .map(([address, { name }]) => ({ name, icon: <CogIcon />, type: 'Program', address }));

      // Add token suggestions
      const tokenSuggestions = tokenList
        ? tokenList
            .filter(token => token.name.toLowerCase().includes(search.toLowerCase()))
            .map(token => ({ name: token.name, icon: token.logoURI ? 
            <Image 
            src={token.logoURI} 
            alt={token.name} 
            width={20} 
            height={20} 
            className="rounded-md"
            /> : <Circle />, type: 'Token', address: token.address }))
        : [];

      newSuggestions.push(...programSuggestions, ...tokenSuggestions);

      setSuggestions(newSuggestions);
      setLoading(false);
    }

    check();
  };

  // Group suggestions by type
  const programSuggestions = suggestions.filter(suggestion => suggestion.type === 'Program');
  const accountSuggestions = suggestions.filter(suggestion => suggestion.type === 'Account');
  const transactionSuggestions = suggestions.filter(suggestion => suggestion.type === 'Transaction');
  const tokenSuggestions = suggestions.filter(suggestion => suggestion.type === 'Token');

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "relative h-10 w-full justify-start rounded-md bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-[500px]",
        )}
        onClick={() => setOpen(true)}
        {...props}
      >
        <span className="hidden lg:inline-flex">
          Search for accounts and transactions..
        </span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-[0.45rem] top-[0.45rem] hidden h-6 w-6 select-none items-center justify-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          {"/"}
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search for accounts and transactions..."
          onValueChange={handleOnValueChange}
        />
        <ScrollArea className="max-h-[300px]">
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {loading && <CommandLoading>Fetching..</CommandLoading>}
            {programSuggestions.length > 0 && (
              <CommandGroup heading="Program">
                {programSuggestions.map((suggestion, index) => (
                  <CommandItem
                    key={`program-${index}`}
                    value={suggestion.name}
                    onSelect={() => {
                      runCommand(() =>
                        router.push(`/address/${suggestion.address}/?cluster=${cluster}`),
                      );
                    }}
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
                    onSelect={() => {
                      runCommand(() =>
                        router.push(`/address/${suggestion.address}/?cluster=${cluster}`),
                      );
                    }}
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
                    onSelect={() => {
                      runCommand(() =>
                        router.push(`/tx/${suggestion.address}/?cluster=${cluster}`),
                      );
                    }}
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
                    onSelect={() => {
                      runCommand(() =>
                        router.push(`/address/${suggestion.address}/?cluster=${cluster}`),
                      );
                    }}
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
