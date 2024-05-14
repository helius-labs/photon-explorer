"use client";

import { RotateCw, LoaderCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetCompressedTokenAccountsByOwner } from "@/lib/web3";
import { Button } from "@/components/ui/button";
import Address from "@/components/address";
import Loading from "@/components/loading";

export default function CompressedTokenAccounts({
  address,
}: {
  address: string;
}) {
  const { accounts, isLoading, isFetching, isError, refetch } =
    useGetCompressedTokenAccountsByOwner(address);

  // TODO: Refactor jsx
  if (isError)
    return (
      <Card className="col-span-12">
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Compressed Accounts</CardTitle>
          </div>
          <Button size="sm" className="ml-auto gap-1" onClick={() => refetch()}>
            {isFetching ? (
              <>
                <LoaderCircle className="mr-1 h-4 w-4 animate-spin" />
                Loading
              </>
            ) : (
              <>
                <RotateCw className="mr-1 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div>Failed to load</div>
        </CardContent>
      </Card>
    );
  if (isLoading)
    return (
      <Card className="col-span-12">
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Compressed Accounts</CardTitle>
          </div>
          <Button size="sm" className="ml-auto gap-1" onClick={() => refetch()}>
            <LoaderCircle className="mr-1 h-4 w-4 animate-spin" />
            Loading
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <Loading />
        </CardContent>
      </Card>
    );
  if (!accounts || !accounts.value.items.length)
    return (
      <Card className="col-span-12">
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Compressed Accounts</CardTitle>
          </div>
          <Button size="sm" className="ml-auto gap-1" onClick={() => refetch()}>
            {isFetching ? (
              <>
                <LoaderCircle className="mr-1 h-4 w-4 animate-spin" />
                Loading
              </>
            ) : (
              <>
                <RotateCw className="mr-1 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div>No compressed token accounts found</div>
        </CardContent>
      </Card>
    );

  // TODO: Use DataTable instead of Table for better pagination, sorting, and filtering
  // Capped transactions at 50 for performance reasons for now

  return (
    <Card className="col-span-12">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Compressed Token Accounts</CardTitle>
        </div>
        <Button size="sm" className="ml-auto gap-1" onClick={() => refetch()}>
          {isFetching ? (
            <>
              <LoaderCircle className="mr-1 h-4 w-4 animate-spin" />
              Loading
            </>
          ) : (
            <>
              <RotateCw className="mr-1 h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Hash</TableHead>
              <TableHead>Account Address</TableHead>
              <TableHead>Account Owner</TableHead>
              <TableHead>Token Mint</TableHead>
              <TableHead>Token Owner</TableHead>
              <TableHead>Token Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.value.items
              .slice(0, 50)
              .map((data: any, index: number) => (
                <TableRow key={`compressed-token-account-${index}`}>
                  <TableCell>
                    <Address>{data.account.hash}</Address>
                  </TableCell>
                  <TableCell>
                    {data.account.address ? (
                      <Address>{data.account.address}</Address>
                    ) : (
                      <>-</>
                    )}
                  </TableCell>
                  <TableCell>
                    <Address>{data.account.owner}</Address>
                  </TableCell>
                  <TableCell>
                    <Address>{data.tokenData.mint}</Address>
                  </TableCell>
                  <TableCell>
                    <Address>{data.tokenData.owner}</Address>
                  </TableCell>
                  <TableCell>
                    {(data.tokenData.amount / 1e9).toFixed(9)} SOL
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
