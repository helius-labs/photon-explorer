import { NextResponse } from "next/server";

export async function GET() {
  const response = await fetch("https://tokens.jup.ag/tokens?tags=verified", {
    next: {
      revalidate: 3600, // 1 hour
    },
  });
  const data = await response.json();

  return NextResponse.json(data);
}
