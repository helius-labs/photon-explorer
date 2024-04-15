import Link from "next/link";
import { ArrowUpRight, CircleHelp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Address from "./address";
import TransactionId from "./transaction-id";

export default function LatestTransactions() {
  return (
    <Card className="col-span-12">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Recent Transactions</CardTitle>
        </div>
        <Button asChild size="sm" className="ml-auto hidden gap-1">
          <Link href="#">
            View All
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center">
                  <span className="mr-1">Slot</span>
                  <Popover>
                    <PopoverTrigger>
                      <CircleHelp className="h-3.5 w-3.5" />
                    </PopoverTrigger>
                    <PopoverContent className="max-w-80">
                      <p className="mb-2">
                        The period of time for which each leader ingests
                        transactions and produces a block.
                      </p>
                      <p>
                        Collectively, slots create a logical clock. Slots are
                        ordered sequentially and non-overlapping, comprising
                        roughly equal real-world time as per PoH.
                      </p>
                    </PopoverContent>
                  </Popover>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  <span className="mr-1">Transaction Id</span>
                  <Popover>
                    <PopoverTrigger>
                      <CircleHelp className="h-3.5 w-3.5" />
                    </PopoverTrigger>
                    <PopoverContent className="max-w-80">
                      <p>
                        The first signature in a transaction, which can be used
                        to uniquely identify the transaction across the complete
                        ledger.
                      </p>
                    </PopoverContent>
                  </Popover>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  <span className="mr-1">Signer</span>
                  <Popover>
                    <PopoverTrigger>
                      <CircleHelp className="h-3.5 w-3.5" />
                    </PopoverTrigger>
                    <PopoverContent className="max-w-80">
                      <p>
                        Transactions include one or more digital signatures each
                        corresponding to an account address referenced by the
                        transaction. Each of these addresses must be the public
                        key of an ed25519 keypair, and the signature signifies
                        that the holder of the matching private key signed, and
                        thus, &quot;authorized&quot; the transaction. In this
                        case, the account is referred to as a signer.
                      </p>
                    </PopoverContent>
                  </Popover>
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>260298528</TableCell>
              <TableCell>
                <TransactionId>
                  3MrqbKPKZ7b7PmYrKff7kUK9svzJQEEUUGfbhmmNtgKhV98tLf8ruW7myjLYDjcr2ik8eSzopcDvYVppLLNB4Mk9
                </TransactionId>
              </TableCell>
              <TableCell>
                <Address>99ht3D5QcWuZKSVJqCycdB4fmF4Da8vzropvd1Sbr2UL</Address>
              </TableCell>
              <TableCell>
                <Badge className="text-xs" variant="outline">
                  Success
                </Badge>
              </TableCell>
              <TableCell>0.0001105 SOL</TableCell>
              <TableCell>2s ago</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>260298528</TableCell>
              <TableCell>
                <TransactionId>
                  2siWWMYyBS3t5vLXdfcLH8oUizasvvyeehNNUS7ZqvpWjxxnk2xK1rxYCrjWFrBnS8jxJu7bMXfQbLNhmadLxgvA
                </TransactionId>
              </TableCell>
              <TableCell>
                <Address>99ht3D5QcWuZKSVJqCycdB4fmF4Da8vzropvd1Sbr2UL</Address>
              </TableCell>
              <TableCell>
                <Badge className="text-xs" variant="outline">
                  Success
                </Badge>
              </TableCell>
              <TableCell>0.0001105 SOL</TableCell>
              <TableCell>2s ago</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>260298528</TableCell>
              <TableCell>
                <TransactionId>
                  2siWWMYyBS3t5vLXdfcLH8oUizasvvyeehNNUS7ZqvpWjxxnk2xK1rxYCrjWFrBnS8jxJu7bMXfQbLNhmadLxgvA
                </TransactionId>
              </TableCell>
              <TableCell>
                <Address>99ht3D5QcWuZKSVJqCycdB4fmF4Da8vzropvd1Sbr2UL</Address>
              </TableCell>
              <TableCell>
                <Badge className="text-xs" variant="outline">
                  Success
                </Badge>
              </TableCell>
              <TableCell>0.0001105 SOL</TableCell>
              <TableCell>2s ago</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
