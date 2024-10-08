"use client";

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

import { useCluster } from "@/providers/cluster-provider";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export function CommandMenu({ ...props }: DialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [program, setProgram] = React.useState<string | null>(null);
  const [transaction, setTransaction] = React.useState<string | null>(null);
  const [address, setAddress] = React.useState<string | null>(null);
  const { cluster } = useCluster();

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
    async function check() {
      setLoading(true);

      setProgram(null);
      setAddress(null);
      setTransaction(null);

      // Check if is program address
      if (isSolanaProgramAddress(search)) {
        setProgram(search);
      }

      // Check if address and not program address
      if (isSolanaAccountAddress(search) && !isSolanaProgramAddress(search)) {
        setAddress(search);
      }

      // Check if is transaction id
      if (isSolanaSignature(search)) {
        setTransaction(search);
      }

      setLoading(false);
    }

    check();
  };

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
          Search for accounts and transactions...
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
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {loading && <CommandLoading>Fetching..</CommandLoading>}
          {program && (
            <CommandGroup heading="Program">
              <CommandItem
                key={`account-${program}`}
                value={program}
                onSelect={() => {
                  runCommand(() =>
                    router.push(`/address/${program}/?cluster=${cluster}`),
                  );
                }}
              >
                <span className="truncate">{program}</span>
              </CommandItem>
            </CommandGroup>
          )}
          {address && (
            <CommandGroup heading="Account">
              <CommandItem
                key={`account-${address}`}
                value={address}
                onSelect={() => {
                  runCommand(() =>
                    router.push(`/address/${address}/?cluster=${cluster}`),
                  );
                }}
              >
                <span className="truncate">{address}</span>
              </CommandItem>
            </CommandGroup>
          )}
          {transaction && (
            <CommandGroup heading="Transaction">
              <CommandItem
                key={`transaction-${transaction}`}
                value={transaction}
                onSelect={() => {
                  runCommand(() =>
                    router.push(`/tx/${transaction}/?cluster=${cluster}`),
                  );
                }}
                className="truncate"
              >
                <span className="truncate">{transaction}</span>
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
