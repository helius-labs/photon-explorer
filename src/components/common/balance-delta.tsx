import { BigNumber } from "bignumber.js";
import React from "react";

import { SolBalance } from "@/components/common/sol-balance";

export function BalanceDelta({
  delta,
  isSol = false,
}: {
  delta: BigNumber;
  isSol?: boolean;
}) {
  let sols;

  if (isSol) {
    sols = <SolBalance lamports={Math.abs(delta.toNumber())} />;
  }

  if (delta.gt(0)) {
    return (
      <span className="font-mono">+{isSol ? sols : delta.toString()}</span>
    );
  } else if (delta.lt(0)) {
    return (
      <span className="font-mono">
        {isSol ? <>-{sols}</> : delta.toString()}
      </span>
    );
  }

  return <span className="font-mono">0 SOL</span>;
}
