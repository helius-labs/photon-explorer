import { constructFullAnsDomain } from "@/utils/domain-info";
import { getAllDomains, reverseLookup } from "@bonfida/spl-name-service";
import { TldParser, getAllTld } from "@onsol/tldparser";
import { Connection, PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

export interface AnsDomainInfo {
  nameAccount: PublicKey;
  domain: string;
}

export interface SnsDomainInfo {
  name: string;
  address: PublicKey;
  owner: string;
}

type DomainInfo = {
  type: "ans-domain" | "sns-domain";
  domain?: string;
  name?: string;
  nameAccount?: PublicKey;
  address?: PublicKey;
};

async function fetchDomains(
  address: string,
  endpoint: string,
): Promise<DomainInfo[]> {
  const connection = new Connection(endpoint, "confirmed");
  const parser = new TldParser(connection);
  const pubKey = new PublicKey(address);

  // Fetch all TLDs
  const allTlds = await getAllTld(connection);

  // Fetch ANS domains
  const allDomains: PublicKey[] = await parser.getAllUserDomains(pubKey);
  const ansDomainInfos: DomainInfo[] = await Promise.all(
    allDomains.map(async (nameAccount) => {
      const fullDomain = await constructFullAnsDomain(connection, nameAccount);
      return { nameAccount, domain: fullDomain, type: "ans-domain" };
    }),
  );

  // Fetch SNS (.sol) domains
  const snsDomainAddresses = await getAllDomains(connection, pubKey);
  const snsDomainInfos: DomainInfo[] = await Promise.all(
    snsDomainAddresses.map(async (address) => {
      const domainName = await reverseLookup(connection, address);
      return {
        name: `${domainName}.sol`,
        address,
        owner: address.toBase58(),
        type: "sns-domain",
      };
    }),
  );

  return [
    ...ansDomainInfos.filter((domainInfo) => domainInfo.domain !== ""),
    ...snsDomainInfos,
  ];
}

export function useFetchDomains(address: string, endpoint: string) {
  return useQuery({
    queryKey: ["fetchDomains", address],
    queryFn: () => fetchDomains(address, endpoint),
    enabled: !!address && !!endpoint,
  });
}
