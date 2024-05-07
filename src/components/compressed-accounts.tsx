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
import { useGetCompressedAccountsByOwner } from "@/lib/web3";
import { Button } from "@/components/ui/button";
import Address from "./address";

export default function CompressedAccounts({ address }: { address: string }) {
  const { accounts, isLoading, isError, refetch } =
    useGetCompressedAccountsByOwner(address);

  // TODO: Refactor jsx
  if (isError)
    return (
      <Card className="col-span-12">
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Compressed Accounts</CardTitle>
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
            <CardTitle>Compressed Accounts</CardTitle>
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
  if (!accounts || !accounts.value.items.length)
    return (
      <Card className="col-span-12">
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Compressed Accounts</CardTitle>
          </div>
          <Button size="sm" className="ml-auto gap-1" onClick={() => refetch()}>
            <RotateCw className="mr-1 h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div>No compressed accounts found</div>
        </CardContent>
      </Card>
    );

  // TODO: Use DataTable instead of Table for better pagination, sorting, and filtering
  // Capped transactions at 50 for performance reasons for now

  return (
    <Card className="col-span-12">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Compressed Accounts</CardTitle>
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
              <TableHead>Hash</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.value.items
              .slice(0, 50)
              .map((data: any, index: number) => (
                <TableRow key={`compressed-account-${index}`}>
                  <TableCell>
                    <Address>{data.hash}</Address>
                  </TableCell>
                  <TableCell>
                    {data.address ? <Address>{data.address}</Address> : <>-</>}
                  </TableCell>
                  <TableCell>
                    <Address>{data.owner}</Address>
                  </TableCell>
                  <TableCell>{data.lamports / 1e9} SOL</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
