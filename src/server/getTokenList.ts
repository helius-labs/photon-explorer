"use server";

import { tokenListSchema } from "@/schemas/tokenList";

export async function getTokenListAll() {
  const response = await fetch("https://token.jup.ag/all");
  const data = await response.json();

  return tokenListSchema.parse(data);
}

export async function getTokenListStrict() {
  const response = await fetch("https://token.jup.ag/strict");
  const data = await response.json();

  return tokenListSchema.parse(data);
}
