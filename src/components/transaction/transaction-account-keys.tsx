import Address from "@/components/common/address";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TransactionAccountKeys({ data }: { data: any }) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Account Keys</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center">
                  <span>#</span>
                </div>
              </TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Signer</TableHead>
              <TableHead>Writetable</TableHead>
              <TableHead>Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.transaction.message.accountKeys.map(
              (item: any, index: number) => (
                <TableRow key={`account-key-${index}`}>
                  <TableCell>{index}</TableCell>
                  <TableCell>
                    <Address>{item.pubkey}</Address>
                  </TableCell>
                  <TableCell>{item.signer ? "Yes" : "No"}</TableCell>
                  <TableCell>{item.writer ? "Yes" : "No"}</TableCell>
                  <TableCell className="capitalize">{item.source}</TableCell>
                </TableRow>
              ),
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
