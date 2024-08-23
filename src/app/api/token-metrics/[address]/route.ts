import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { address: string } },
) {
  const { address } = params;

  const response = await fetch(
    `https://catdetlist.jup.ag/api/metrics/${address}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 3600, // 1 hour
      },
    },
  );

  if (response.ok) {
    const data = await response.json();
    return NextResponse.json(data);
  }
}
