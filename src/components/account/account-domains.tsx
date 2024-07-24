"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCluster } from "@/providers/cluster-provider";
import { useFetchDomains } from "@/hooks/useFetchDomains";
import { Card, CardContent } from "@/components/ui/card";
import Loading from "@/components/common/loading";
import LoadingBadge from "@/components/common/loading-badge";
import { DataTable } from "@/components/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Copy, CheckIcon } from "lucide-react";
import { shortenLong } from "@/utils/common";

const DomainAddressCell = ({ value }: { value: string | undefined }) => {
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => {
        setHasCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  if (!value) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={`/address/${value}`} className="text-muted-foreground hover:underline cursor-pointer">
            {shortenLong(value)}
          </Link>
        </TooltipTrigger>
        <TooltipContent>{value}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="ml-2 h-5 w-5 rounded-[6px] [&_svg]:size-3.5"
            onClick={() => {
              navigator.clipboard.writeText(value);
              setHasCopied(true);
            }}
          >
            <span className="sr-only">Copy</span>
            {hasCopied ? <CheckIcon /> : <Copy />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy address</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Define the columns configuration for the data table
const columns: ColumnDef<any>[] = [
  {
    accessorKey: "domain",
    header: "Domain Name",
    cell: ({ getValue }) => getValue() as string,
  },
  {
    accessorKey: "address",
    header: "Domain Address",
    cell: ({ getValue }) => <DomainAddressCell value={getValue() as string} />,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ getValue }) => (getValue() === "sns-domain" ? "SNS" : "ANS"),
  },
];

export default function AccountDomains({ address }: { address: string }) {
  const { endpoint } = useCluster();

  // Use the custom hook to fetch all domain names
  const { data: userDomains, isLoading: loadingDomains } = useFetchDomains(address, endpoint);

  if (loadingDomains) {
    return (
      <Card className="col-span-12 mb-10 shadow overflow-hidden mx-[-1rem] md:mx-0">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <Loading className="h-12 w-12" />
          <LoadingBadge text="Loading Domains" />
        </CardContent>
      </Card>
    );
  }

  if (!userDomains || userDomains.length === 0) {
    return (
      <Card className="col-span-12 mb-10 shadow overflow-hidden mx-[-1rem] md:mx-0">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center p-6">
            <div className="text-lg text-muted-foreground">No Domains Found</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tableData = userDomains.map((domain: any) => ({
    domain: domain.type === "sns-domain" ? domain.name : domain.domain,
    address: domain.address.toBase58(),
    type: domain.type,
  }));

  return (
    <Card className="col-span-12 mb-10 shadow overflow-hidden mx-[-1rem] md:mx-0">
      <CardContent className="pt-6">
        <DataTable columns={columns} data={tableData} />
      </CardContent>
    </Card>
  );
}
