import React from "react";

import { lamportsToSolString } from "@/utils/common";

export function SolBalance({
  lamports,
  maximumFractionDigits = 9,
}: {
  lamports: number | bigint;
  maximumFractionDigits?: number;
}) {
  return (
    <span>
      <span className="font-mono">
        {lamportsToSolString(lamports, maximumFractionDigits)} SOL
      </span>
    </span>
  );
}
