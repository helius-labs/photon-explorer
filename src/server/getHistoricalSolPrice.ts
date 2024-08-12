interface BirdeyeApiResponse {
  data: {
    items: {
      address: string;
      unixTime: number;
      value: number;
    }[];
  };
  success: boolean;
}

export async function getHistoricalSolPrice(
  currentTimestamp: number,
): Promise<number> {
  const BirdeyeAPI = "6cb3e24d2ca349169357645825fc3b62";
  const SOL_ADDRESS = "So11111111111111111111111111111111111111112";

  const fromTimestamp = currentTimestamp - 30;
  const toTimestamp = currentTimestamp + 30;

  const url = new URL("https://public-api.birdeye.so/defi/history_price");
  url.searchParams.append("address", SOL_ADDRESS);
  url.searchParams.append("address_type", "token");
  url.searchParams.append("type", "1m");
  url.searchParams.append("time_from", fromTimestamp.toString());
  url.searchParams.append("time_to", toTimestamp.toString());

  const options = {
    method: "GET",
    headers: { "X-API-KEY": BirdeyeAPI },
  };

  try {
    const response = await fetch(url.toString(), options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: BirdeyeApiResponse = await response.json();

    if (data.success && data.data.items.length > 0) {
      // Return the value of the first item if successful
      return data.data.items[0].value;
    } else {
      // Return 0 if not successful or no items
      return 0;
    }
  } catch (error) {
    console.error("Error fetching historical SOL price:", error);
    // Return 0 in case of any error
    return 0;
  }
}
