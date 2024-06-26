import { getDomainInfo } from "@/utils/domain-info";
import { Connection } from "@solana/web3.js";
import { NextResponse } from "next/server";

type Params = {
  params: {
    domain: string;
  };
};

export type FetchedDomainInfo = Awaited<ReturnType<typeof getDomainInfo>>;

export async function GET(_request: Request, { params: { domain } }: Params) {
  // Intentionally using legacy web3js for compatibility with bonfida library
  // This is an API route so won't affect client bundle
  // We only fetch domains on mainnet
  const connection = new Connection(process.env.NEXT_PUBLIC_MAINNET!);
  const domainInfo = await getDomainInfo(domain, connection);

  return NextResponse.json(domainInfo, {
    headers: {
      // 24 hours
      "Cache-Control": "max-age=86400",
    },
  });
}
