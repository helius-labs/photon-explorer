"use client";

import React from "react";
import { useCluster } from "@/providers/cluster-provider";
import { useFetchDomains } from "@/hooks/useFetchDomains";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";

// Define the columns configuration for the data table
const columns: ColumnDef<any>[] = [
  {
    accessorKey: "domain",
    header: "Domain",
    cell: ({ getValue }) => getValue(),
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
      <Card className="col-span-12">
        <CardContent className="flex flex-col gap-4 pt-6">
          {[0, 1, 2].map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!userDomains || userDomains.length === 0) {
    return (
      <Card className="col-span-12 mb-10">
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
    type: domain.type,
  }));

  return (
    <Card className="col-span-12 mb-10">
      <CardContent className="pt-6">
        <DataTable columns={columns} data={tableData} />
      </CardContent>
    </Card>
  );
}
