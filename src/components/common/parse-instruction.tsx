"use client";

import { PublicKey } from "@solana/web3.js";
import * as React from "react";

import { useParseInstructions } from "@/hooks/useParseInstructions";

import Data from "./data";

interface Props {
  programId: PublicKey;
  data: string;
}

export default function ParseInstruction({ programId, data }: Props) {
  const parsed = useParseInstructions(programId, data);

  if (parsed.isLoading) return <div>Parsing...</div>;

  if (parsed.isError || !parsed.data) return <Data data={data} />;

  return <Data data={parsed.data} />;
}
