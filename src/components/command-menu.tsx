"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DialogProps } from "@radix-ui/react-dialog";
import { useTheme } from "next-themes";
import {
  cn,
  isSolanaAccountAddress,
  isSolanaTransactionHash,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CommandLoading } from "cmdk";

export function CommandMenu({ ...props }: DialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [transaction, setTransaction] = React.useState<string | null>(null);
  const [address, setAddress] = React.useState<string | null>(null);

  const { setTheme } = useTheme();

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

      setTransaction(null);
      setAddress(null);

      //Check if is transaction id
      if (isSolanaTransactionHash(search)) {
        setTransaction(search);
      }

      // Check if address
      if (isSolanaAccountAddress(search)) {
        setAddress(search);
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
          "relative h-10 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-[300px]",
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
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {loading && <CommandLoading>Fetching..</CommandLoading>}
          {address && (
            <CommandGroup heading="Account">
              <CommandItem
                key={`account-${address}`}
                value={address}
                onSelect={() => {
                  runCommand(() => router.push(`/address/${address}/`));
                }}
              >
                {address}
              </CommandItem>
            </CommandGroup>
          )}
          {transaction && (
            <CommandGroup heading="Transaction">
              <CommandItem
                key={`transaction-${transaction}`}
                value={transaction}
                onSelect={() => {
                  runCommand(() => router.push(`/tx/${transaction}/`));
                }}
              >
                {transaction}
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
