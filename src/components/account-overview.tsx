"use client";

import Avatar from "boring-avatars";
import { MoreVertical, Star } from "lucide-react";

import { useGetCompressedBalanceByOwner } from "@/hooks/compression";
import { useGetBalance } from "@/hooks/web3";

import Address from "@/components/address";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AccountOverview({
  address,
  accountInfo,
}: {
  address: string;
  accountInfo: any;
}) {
  const { balance } = useGetBalance(address);
  const { compressedBalance } = useGetCompressedBalanceByOwner(address);

  return (
    <div className="flex items-center gap-4 mb-8">
      <Avatar
        size={80}
        name={address}
        variant="marble"
        colors={["#D31900", "#E84125", "#9945FF", "#14F195", "#000000"]}
      />
      <div className="grid gap-2">
        <div className="text-3xl font-medium leading-none">
          <Address>{address}</Address>
        </div>
        <p className="text-lg text-muted-foreground">
          {balance &&
            Number(balance.value / 1e9).toLocaleString(undefined, {
              minimumFractionDigits: 5,
            })}{" "}
          SOL
        </p>
      </div>
      <div className="ml-auto font-medium self-start">
        <div className="ml-auto flex items-center gap-1">
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <Star className="h-3.5 w-3.5" />
            <span className="sr-only">Star</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" className="h-8 w-8">
                <MoreVertical className="h-3.5 w-3.5" />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  accountInfo.refetch();
                }}
              >
                Refresh
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
    // <Card className="mb-3 w-full">
    //   <CardHeader>
    //     <CardTitle>Overview</CardTitle>
    //   </CardHeader>
    //   <CardContent>
    //     <div className="grid grid-cols-4 gap-3">
    //       <div className="flex items-center">
    //         <span className="mr-1 text-muted-foreground">Address</span>
    //       </div>
    //       <div className="col-span-3">
    //         <Address short={false}>{address}</Address>
    //       </div>

    //       <div className="col-span-1">
    //         <span className="text-muted-foreground">Balance</span>
    //       </div>
    //       <div className="col-span-3">
    //         <span>
    //           {balance &&
    //             Number(balance.value / 1e9).toLocaleString(undefined, {
    //               minimumFractionDigits: 9,
    //             })}{" "}
    //           SOL
    //         </span>
    //       </div>

    //       <div className="col-span-1">
    //         <span className="text-muted-foreground">Allocated Data Size</span>
    //       </div>
    //       <div className="col-span-3">
    //         <span>{account.value && account.value.space} byte(s)</span>
    //       </div>

    //       <div className="col-span-1">
    //         <span className="text-muted-foreground">Owner Program</span>
    //       </div>
    //       <div className="col-span-3">
    //         <Address short={false}>
    //           {account.value && account.value.owner}
    //         </Address>
    //       </div>

    //       <div className="col-span-1">
    //         <span className="text-muted-foreground">Executable</span>
    //       </div>
    //       <div className="col-span-3">
    //         {account.value && account.value.executable ? "Yes" : "No"}
    //       </div>

    //       {account.value.data.parsed && (
    //         <>
    //           <Separator className="col-span-4 my-4" />

    //           <div className="col-span-1">
    //             <span className="text-muted-foreground">Type</span>
    //           </div>
    //           <div className="col-span-3 capitalize">
    //             {account.value.data.parsed.type}
    //           </div>

    //           {account.value.data.program && (
    //             <>
    //               <div className="col-span-1">
    //                 <span className="text-muted-foreground">Program</span>
    //               </div>
    //               <div className="col-span-3">{account.value.data.program}</div>
    //             </>
    //           )}

    //           {account.value.data.parsed.info.programData && (
    //             <>
    //               <div className="col-span-1">
    //                 <span className="text-muted-foreground">Program Data</span>
    //               </div>
    //               <div className="col-span-3">
    //                 <Data>{account.value.data.parsed.info.programData}</Data>
    //               </div>
    //             </>
    //           )}

    //           {account.value.data.parsed.info.mint && (
    //             <>
    //               <div className="col-span-1">
    //                 <span className="text-muted-foreground">Token mint</span>
    //               </div>
    //               <div className="col-span-3">
    //                 <Address short={false}>
    //                   {account.value.data.parsed.info.mint}
    //                 </Address>
    //               </div>
    //             </>
    //           )}

    //           {account.value.data.parsed.info.owner && (
    //             <>
    //               <div className="col-span-1">
    //                 <span className="text-muted-foreground">Token owner</span>
    //               </div>
    //               <div className="col-span-3">
    //                 <Address short={false}>
    //                   {account.value.data.parsed.info.owner}
    //                 </Address>
    //               </div>
    //             </>
    //           )}

    //           {account.value.data.parsed.info.tokenAmount && (
    //             <>
    //               <div className="col-span-1">
    //                 <span className="text-muted-foreground">Token balance</span>
    //               </div>
    //               <div className="col-span-3">
    //                 <span>
    //                   {account.value.data.parsed.info.tokenAmount.uiAmount}
    //                 </span>
    //               </div>
    //             </>
    //           )}
    //         </>
    //       )}

    //       <Separator className="col-span-4 my-4" />

    //       <div className="col-span-1">
    //         <span className="text-muted-foreground">Compressed Balance</span>
    //       </div>
    //       <div className="col-span-3">
    //         <span>
    //           {compressedBalance && compressedBalance.value ? (
    //             <>
    //               {Number(compressedBalance.value / 1e9).toLocaleString(
    //                 undefined,
    //                 {
    //                   minimumFractionDigits: 9,
    //                 },
    //               )}{" "}
    //               SOL
    //             </>
    //           ) : (
    //             <>-</>
    //           )}
    //         </span>
    //       </div>
    //     </div>
    //   </CardContent>
    // </Card>
  );
}
