import { DomainInfo as SnsDomainInfo } from "@/utils/domain-info";
import { getAllDomains, reverseLookup } from "@bonfida/spl-name-service";
import { NameRecordHeader, TldParser } from "@onsol/tldparser";
import { Connection, PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

interface AnsDomainInfo {
  nameAccount: PublicKey;
  domain: string;
}

type DomainInfo = AnsDomainInfo | SnsDomainInfo;

const fetchAllDomains = async (
  publicKey: string,
  endpoint: string,
): Promise<DomainInfo[]> => {
  const connection = new Connection(endpoint);
  const parser = new TldParser(connection);
  const pubKey = new PublicKey(publicKey);

  // Fetch ANS domains
  const allDomains: PublicKey[] = await parser.getAllUserDomains(pubKey);
  const ansDomainInfos: AnsDomainInfo[] = await Promise.all(
    allDomains.map(async (nameAccount) => {
      const nameRecord = await NameRecordHeader.fromAccountAddress(
        connection,
        nameAccount,
      );
      if (!nameRecord || !nameRecord.parentName)
        return { nameAccount, domain: "" };

      const parentNameRecord = await NameRecordHeader.fromAccountAddress(
        connection,
        nameRecord.parentName,
      );
      if (!parentNameRecord || !parentNameRecord.owner)
        return { nameAccount, domain: "" };

      const domain = await parser.reverseLookupNameAccount(
        nameAccount,
        parentNameRecord.owner,
      );
      return { nameAccount, domain };
    }),
  );

  // Fetch SNS (.sol) domains
  const snsDomainAddresses = await getAllDomains(connection, pubKey);
  const snsDomainInfos: SnsDomainInfo[] = await Promise.all(
    snsDomainAddresses.map(async (address) => {
      const domainName = await reverseLookup(connection, address);
      return {
        name: `${domainName}.sol`,
        address,
        owner: publicKey,
      };
    }),
  );

  return [
    ...ansDomainInfos.filter((domainInfo) => domainInfo.domain !== ""),
    ...snsDomainInfos,
  ];
};

export const useAllDomains = (publicKey: string, endpoint: string) => {
  return useQuery<DomainInfo[], Error>({
    queryKey: ["allDomains", publicKey],
    queryFn: () => fetchAllDomains(publicKey, endpoint),
    enabled: !!publicKey && !!endpoint,
  });
};
