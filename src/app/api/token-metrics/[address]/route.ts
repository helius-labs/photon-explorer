import { getBaseUrl } from "@/utils/common";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { address: string } },
) {
  const { address } = params;
  const baseUrl = getBaseUrl();

  try {
    const response = await fetch(`${baseUrl}/api/metrics/${address}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch data" },
        { status: 500 },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching token metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}
