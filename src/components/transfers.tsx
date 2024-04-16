import { CircleHelp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import Address from "@/components/address";
import TransactionHash from "@/components/transaction-hash";

export default function Transfers() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <div className="flex items-center">
                <Popover>
                  <PopoverTrigger>
                    <CircleHelp className="mr-1 h-3.5 w-3.5" />
                  </PopoverTrigger>
                  <PopoverContent className="max-w-80">
                    <p>
                      The first signature in a transaction, which can be used to
                      uniquely identify the transaction across the complete
                      ledger.
                    </p>
                  </PopoverContent>
                </Popover>
                <span className="mr-1">Transaction Hash</span>
              </div>
            </TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((key) => (
            <TableRow key={key}>
              <TableCell>
                <TransactionHash>
                  3MrqbKPKZ7b7PmYrKff7kUK9svzJQEEUUGfbhmmNtgKhV98tLf8ruW7myjLYDjcr2ik8eSzopcDvYVppLLNB4Mk9
                </TransactionHash>
              </TableCell>
              <TableCell>2s ago</TableCell>
              <TableCell>
                <Address>99ht3D5QcWuZKSVJqCycdB4fmF4Da8vzropvd1Sbr2UL</Address>
              </TableCell>
              <TableCell>
                <Address>99ht3D5QcWuZKSVJqCycdB4fmF4Da8vzropvd1Sbr2UL</Address>
              </TableCell>
              <TableCell>0.0001105 SOL</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
