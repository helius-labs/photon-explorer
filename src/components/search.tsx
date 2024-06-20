"use client";

import { useCluster } from "@/providers/cluster-provider";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import {
  isSolanaAccountAddress,
  isSolanaProgramAddress,
  isSolanaSignature,
} from "@/lib/utils";

import { Button } from "@/components/ui/button";

import { Input } from "./ui/input";

export function Search({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const router = useRouter();

  const { cluster } = useCluster();

  const [search, setSearch] = React.useState("");

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!search) {
      return;
    }

    // Check if is transaction id
    if (isSolanaSignature(search)) {
      router.push(`/tx/${search}/?cluster=${cluster}`);
    } else {
      router.push(`/address/${search}/?cluster=${cluster}`);
    }
  };

  return (
    <form
      onSubmit={onFormSubmit}
      className="flex flex-col items-center space-y-4"
    >
      <Input
        startIcon={SearchIcon}
        type="search"
        placeholder="Search for accounts or transactions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-12"
        iconClassName="left-4"
        inputPaddingClassName="pl-12 pr-4" // Adjusted padding for left space
        endiconclassname="right-6"
        />

      <Button type="submit" variant="outline" disabled={!search}>
        Search
      </Button>
    </form>
  );
}
