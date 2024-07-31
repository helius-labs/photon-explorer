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
import Image from "next/image";
import snsLogo from "@/../public/assets/snsLogo.png";
import ansLogo from "@/../public/assets/ansLogo.jpg";

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
      <div className="flex items-center space-x-2">
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
              className="h-5 w-5 rounded-[6px] [&_svg]:h-4 [&_svg]:w-4"
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
      </div>
    </TooltipProvider>
  );
};

// Define the columns configuration for the data table
const columns: ColumnDef<any>[] = [
  {
    accessorKey: "domain",
    header: () => <div className="text-left pl-4" style={{ minWidth: '155px' }}>Domain Name</div>,
    cell: ({ row }) => (
      <div className="text-left truncate pl-4" style={{ minWidth: '155px' }}>
        {row.original.domain}
      </div>
    ),
  },
  {
    accessorKey: "address",
    header: "Domain Address",
    cell: ({ row }) => (
      <div className="text-left truncate">
        <DomainAddressCell value={row.original.address} />
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <div className="text-left truncate flex items-center">
        {row.original.type === "sns-domain" ? (
          <>
            SNS
            <a href="https://www.sns.id/" target="_blank" rel="noopener noreferrer">
              <Image
                src={snsLogo}
                alt="SNS Logo"
                width={16}
                height={16}
                className="ml-2 rounded-full"
              />
            </a>
          </>
        ) : (
          <>
            ANS
            <a href="https://alldomains.id/" target="_blank" rel="noopener noreferrer">
              <Image
                src={ansLogo}
                alt="ANS Logo"
                width={16}
                height={16}
                className="ml-2 rounded-full"
              />
            </a>
          </>
        )}
      </div>
    ),
  },
];

const DomainCard = ({ domain }: { domain: any }) => {
  const address = domain.address ? domain.address.toString() : "";
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => {
        setHasCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="font-semibold">
        {domain.type === "sns-domain" ? domain.name : domain.domain}
      </div>
      <div className="flex items-center text-sm text-muted-foreground">
        {domain.type === "sns-domain" ? (
          <>
            SNS
            <a href="https://www.sns.id/" target="_blank" rel="noopener noreferrer">
              <Image
                src={snsLogo}
                alt="SNS Logo"
                width={16}
                height={16}
                className="ml-2 rounded-full"
              />
            </a>
          </>
        ) : (
          <>
            ANS
            <a href="https://alldomains.id/" target="_blank" rel="noopener noreferrer">
              <Image
                src={ansLogo}
                alt="ANS Logo"
                width={16}
                height={16}
                className="ml-2 rounded-full"
              />
            </a>
          </>
        )}
      </div>
      {address && (
        <div className="flex items-center text-sm text-muted-foreground space-x-2">
          <span>{shortenLong(address)}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5 rounded-[6px] [&_svg]:h-4 [&_svg]:w-4"
                  onClick={() => {
                    navigator.clipboard.writeText(address);
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
        </div>
      )}
    </div>
  );
};

export default function AccountDomains({ address }: { address: string }) {
  const { endpoint } = useCluster();

  // Use the custom hook to fetch all domain names
  const { data: userDomains, isLoading: loadingDomains, isError } = useFetchDomains(address, endpoint);

  if (isError) {
    return (
      <Card className="col-span-12 mb-10 shadow overflow-hidden mx-[-1rem] md:mx-0">
        <CardContent className="flex flex-col items-center gap-4 pb-6 pt-6">
          <div className="font-semibold text-secondary">Unable to fetch domains</div>
          <div className="text-gray-500">
            <button onClick={() => window.location.reload()} className="text-blue-500 underline">Refresh</button> or change networks.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loadingDomains) {
    return (
      <Card className="col-span-12 mb-10 shadow overflow-hidden mx-[-1rem] md:mx-0">
        <CardContent className="flex flex-col items-center gap-4 py-6">
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
    address: domain.address?.toBase58(),
    type: domain.type,
  }));

  return (
    <Card className="col-span-12 mb-10 shadow overflow-hidden mx-[-1rem] md:mx-0">
      <CardContent className="flex flex-col gap-4 pb-6 pt-6">
        <div className="block md:hidden">
          {userDomains.map((domain) => (
            <DomainCard key={domain.address?.toBase58()} domain={domain} />
          ))}
        </div>
        <div className="hidden md:block">
          <DataTable columns={columns} data={tableData} />
        </div>
      </CardContent>
    </Card>
  );
}
