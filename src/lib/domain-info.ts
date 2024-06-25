import {
  getHashedNameSync,
  getNameAccountKeySync,
  resolve,
} from "@bonfida/spl-name-service";
import { Connection, PublicKey } from "@solana/web3.js";

// Address of the SOL TLD
export const SOL_TLD_AUTHORITY = new PublicKey(
  "58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx",
);

function getDomainKeySync(
  name: string,
  nameClass?: PublicKey,
  nameParent?: PublicKey,
) {
  const hashedDomainName = getHashedNameSync(name);
  const nameKey = getNameAccountKeySync(
    hashedDomainName,
    nameClass,
    nameParent,
  );
  return nameKey;
}

export interface DomainInfo {
  name: string;
  address: PublicKey;
  owner: string;
}

export const hasDomainSyntax = (value: string) => {
  return value.length > 4 && value.substring(value.length - 4) === ".sol";
};

// returns non-empty wallet string if a given .sol domain is owned by a wallet
export async function getDomainInfo(
  domain: string,
  connection: Connection,
): Promise<DomainInfo | null> {
  const domainKey = getDomainKeySync(
    domain.slice(0, -4), // remove .sol
    undefined,
    SOL_TLD_AUTHORITY,
  );
  try {
    const ownerPublicKey = await resolve(connection, domain);
    return {
      name: domain,
      address: domainKey,
      owner: ownerPublicKey.toString(),
    };
  } catch {
    return null;
  }
}
