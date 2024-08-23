import { tokenPriceSchema } from "@/schemas/tokenPrice";

export async function getTokenPrices(ids: string[]) {
  if (ids.length === 0) {
    return null;
  }

  const response = await fetch(
    "https://price.jup.ag/v6/price?ids=" + ids.join(","),
  );
  const data = await response.json();

  return tokenPriceSchema.parse(data);
}
