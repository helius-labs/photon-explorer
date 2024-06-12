// "use client";

// import { lamportsToSolString } from "@/lib/utils";

// import { useGetCompressedBalanceByOwner } from "@/hooks/compression";
// import { useGetBalance } from "@/hooks/web3";

// import Address from "@/components/common/address";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import Data from "@/components/common/data";

// export default function AccountOverview({
//   address,
//   accountInfo,
// }: {
//   address: string;
//   accountInfo: any;
// }) {
//   const { data:balance } = useGetBalance(address);
//   const { compressedBalance } = useGetCompressedBalanceByOwner(address);

//   return (
//     <Card className="mb-3 w-full">
//       <CardHeader>
//         <CardTitle>Overview</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="grid grid-cols-4 gap-3">
//           <div className="flex items-center">
//             <span className="mr-1 text-muted-foreground">Address</span>
//           </div>
//           <div className="col-span-3">
//             <Address>{address}</Address>
//           </div>

//           <div className="col-span-1">
//             <span className="text-muted-foreground">Balance</span>
//           </div>
//           <div className="col-span-3">
//             <span>
//               {balance && `${lamportsToSolString(balance.value, 5)} SOL`}
//             </span>
//           </div>

//           <div className="col-span-1">
//             <span className="text-muted-foreground">Allocated Data Size</span>
//           </div>
//           <div className="col-span-3">
//             <span>{accountInfo.value && accountInfo.value.space} byte(s)</span>
//           </div>

//           <div className="col-span-1">
//             <span className="text-muted-foreground">Owner Program</span>
//           </div>
//           <div className="col-span-3">
//             <Address>{accountInfo.value && accountInfo.value.owner}</Address>
//           </div>

//           <div className="col-span-1">
//             <span className="text-muted-foreground">Executable</span>
//           </div>
//           <div className="col-span-3">
//             {accountInfo.value && accountInfo.value.executable ? "Yes" : "No"}
//           </div>

//           {accountInfo.value.data.parsed && (
//             <>
//               <Separator className="col-span-4 my-4" />

//               <div className="col-span-1">
//                 <span className="text-muted-foreground">Type</span>
//               </div>
//               <div className="col-span-3 capitalize">
//                 {accountInfo.value.data.parsed.type}
//               </div>

//               {accountInfo.value.data.program && (
//                 <>
//                   <div className="col-span-1">
//                     <span className="text-muted-foreground">Program</span>
//                   </div>
//                   <div className="col-span-3">{accountInfo.value.data.program}</div>
//                 </>
//               )}

//               {accountInfo.value.data.parsed.info.programData && (
//                 <>
//                   <div className="col-span-1">
//                     <span className="text-muted-foreground">Program Data</span>
//                   </div>
//                   <div className="col-span-3">
//                     <Data>{accountInfo.value.data.parsed.info.programData}</Data>
//                   </div>
//                 </>
//               )}

//               {accountInfo.value.data.parsed.info.mint && (
//                 <>
//                   <div className="col-span-1">
//                     <span className="text-muted-foreground">Token mint</span>
//                   </div>
//                   <div className="col-span-3">
//                     <Address>{accountInfo.value.data.parsed.info.mint}</Address>
//                   </div>
//                 </>
//               )}

//               {accountInfo.value.data.parsed.info.owner && (
//                 <>
//                   <div className="col-span-1">
//                     <span className="text-muted-foreground">Token owner</span>
//                   </div>
//                   <div className="col-span-3">
//                     <Address>{accountInfo.value.data.parsed.info.owner}</Address>
//                   </div>
//                 </>
//               )}

//               {accountInfo.value.data.parsed.info.tokenAmount && (
//                 <>
//                   <div className="col-span-1">
//                     <span className="text-muted-foreground">Token balance</span>
//                   </div>
//                   <div className="col-span-3">
//                     <span>
//                       {accountInfo.value.data.parsed.info.tokenAmount.uiAmount}
//                     </span>
//                   </div>
//                 </>
//               )}
//             </>
//           )}

//           <Separator className="col-span-4 my-4" />

//           <div className="col-span-1">
//             <span className="text-muted-foreground">Compressed Balance</span>
//           </div>
//           <div className="col-span-3">
//             <span>
//               {compressedBalance && compressedBalance.value ? (
//                 <>{`${lamportsToSolString(compressedBalance.value, 9)} SOL`}</>
//               ) : (
//                 <>-</>
//               )}
//             </span>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
