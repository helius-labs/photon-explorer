import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { address: string } },
) {
  const { address } = params;

  try {
    const response = await fetch(
      `https://catdetlist.jup.ag/api/metrics/${address}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch data" },
        { status: 500 },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}
