import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api-c.walletlabels.xyz/solana/label?address=${address}`,
      {
        next: {
          revalidate: 3600, // Cache for 1 hour
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch wallet label");
    }

    const data = await response.json();
    console.log("API response:", data); // Log the API response

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching wallet label:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet label" },
      { status: 500 },
    );
  }
}
