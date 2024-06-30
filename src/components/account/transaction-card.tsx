import { timeAgoWithFormat } from "@/utils/common";
import { SignatureWithMetadata } from "@lightprotocol/stateless.js";
import { ConfirmedSignatureInfo } from "@solana/web3.js";
import { CircleArrowDown, CircleCheck } from "lucide-react";
import Signature from "@/components/common/signature";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<ConfirmedSignatureInfo | SignatureWithMetadata>[] = [
  {
    header: () => (
      <div className="flex items-center gap-2">
        <span className="text-sm font-base leading-none">Received</span>
      </div>
    ),
    accessorKey: "blockTime",
    cell: ({ getValue }) => (
      <div className="flex items-center gap-2">
        <CircleArrowDown strokeWidth={1} className="h-8 w-8 md:h-12 md:w-12" />
        <div className="grid gap-1">
          <div className="text-sm font-base leading-none">Received</div>
          <div className="text-sm text-muted-foreground">
            {getValue() ? timeAgoWithFormat(Number(getValue()), true) : ""}
          </div>
        </div>
      </div>
    ),
  },
  {
    header: () => (
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm font-base leading-none">Status</span>
      </div>
    ),
    accessorKey: "status",
    cell: () => (
      <div className="flex items-center gap-2 md:justify-center">
        <div className="h-8 w-8 md:h-12 md:w-12 flex items-start justify-start">
          <CircleCheck strokeWidth={1} className="h-full w-full" />
        </div>
        <div className="grid gap-1 text-center">
          <div className="text-sm font-medium leading-none">+10 hSOL</div>
          <div className="text-sm text-muted-foreground">$1500.00</div>
        </div>
      </div>
    ),
  },
  {
    header: () => (
      <div className="flex items-center justify-end gap-2">
        <span className="text-sm font-base leading-none">From</span>
      </div>
    ),
    accessorKey: "signature",
    cell: ({ getValue }) => (
      <div className="flex flex-col items-end gap-1">
        <div className="text-sm text-muted-foreground">From</div>
        <div className="text-sm font-base leading-none">
          <Signature copy={false} signature={getValue() as string} />
        </div>
      </div>
    ),
  },
];
