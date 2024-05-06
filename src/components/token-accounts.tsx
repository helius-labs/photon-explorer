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
import { useGetTokenAccountsByOwner } from "@/lib/web3";
import { Button } from "@/components/ui/button";
import Address from "./address";

export default function TokenAccounts({ address }: { address: string }) {
  const { accounts, isLoading, isError, refetch } =
    useGetTokenAccountsByOwner(address);

  // TODO: Refactor jsx
  if (isError)
    return (
      <Card className="col-span-12">
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Token Accounts</CardTitle>
          </div>
          <Button size="sm" className="ml-auto gap-1" onClick={() => refetch()}>
            <RotateCw className="mr-1 h-4 w-4" />
            Refresh
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
            <CardTitle>Token Accounts</CardTitle>
          </div>
          <Button size="sm" className="ml-auto gap-1" onClick={() => refetch()}>
            <LoaderCircle className="mr-1 h-4 w-4 animate-spin" />
            Loading
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div>Loading...</div>
        </CardContent>
      </Card>
    );
  if (!accounts || !accounts.value.length)
    return (
      <Card className="col-span-12">
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Token Accounts</CardTitle>
          </div>
          <Button size="sm" className="ml-auto gap-1" onClick={() => refetch()}>
            <RotateCw className="mr-1 h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div>No token accounts found</div>
        </CardContent>
      </Card>
    );

  // TODO: Use DataTable instead of Table for better pagination, sorting, and filtering
  // Capped transactions at 50 for performance reasons for now

  return (
    <Card className="col-span-12">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Token Accounts</CardTitle>
        </div>
        <Button size="sm" className="ml-auto gap-1" onClick={() => refetch()}>
          <RotateCw className="mr-1 h-4 w-4" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account address</TableHead>
              <TableHead>Mint address</TableHead>
              <TableHead>Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.value.slice(0, 50).map((data: any, index: number) => (
              <TableRow key={`token-account-${index}`}>
                <TableCell>
                  <Address short={false}>{data.pubkey}</Address>
                </TableCell>
                <TableCell>
                  <Address short={false}>
                    {data.account.data.parsed.info.mint}
                  </Address>
                </TableCell>
                <TableCell>
                  {data.account.data.parsed.info.tokenAmount.uiAmount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
