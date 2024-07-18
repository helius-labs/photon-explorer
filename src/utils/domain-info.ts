import {
  NameRegistryState,
  getHashedNameSync,
  getNameAccountKeySync,
  resolve,
} from "@bonfida/spl-name-service";
import { NameRecordHeader, TldParser } from "@onsol/tldparser";
import { Connection, PublicKey } from "@solana/web3.js";

// Address of the SOL TLD
export const SOL_TLD_AUTHORITY = new PublicKey(
  "58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx",
);

export interface DomainInfo {
  name: string;
  address: PublicKey;
  owner: string;
}

export function getDomainKeySync(
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

// returns non empty wallet string if a given .sol domain is owned by a wallet
export async function getDomainInfo(domain: string, connection: Connection) {
  try {
    const pubkey = getDomainKeySync(domain);

    const { registry, nftOwner } = await NameRegistryState.retrieve(
      connection,
      pubkey,
    );

    return registry.owner
      ? {
          address: pubkey.toBase58(),
          owner: registry.owner.toBase58(),
        }
      : null;
  } catch {
    return null;
  }
}

export const hasDomainSyntax = (value: string) => {
  return value.length > 4 && value.substring(value.length - 4) === ".sol";
};

// Check and fetch data to confirm if a string is a valid Bonfida domain
export async function isBonfidaDomainAddress(
  domain: string,
  connection: Connection,
): Promise<boolean> {
  // 1. Check if the string has Bonfida domain syntax
  const probablyBonfidaName = hasDomainSyntax(domain);
  if (probablyBonfidaName) {
    try {
      // 2. Get the domain key
      const domainKey = getDomainKeySync(
        domain.slice(0, -4), // remove .sol
        undefined,
        SOL_TLD_AUTHORITY,
      );

      // 3. Fetch account information
      const accountInfo = await connection.getAccountInfo(domainKey);
      if (accountInfo) {
        // 4. Resolve the owner public key
        const ownerPublicKey = await resolve(connection, domain);
        return ownerPublicKey !== null;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
  // 5. If the string does not have the correct syntax, return false
  return false;
}

// Function to construct the full ANS domain name
export async function constructFullAnsDomain(
  connection: Connection,
  nameAccount: PublicKey,
): Promise<string> {
  const ans = new TldParser(connection);
  const nameRecord = await NameRecordHeader.fromAccountAddress(
    connection,
    nameAccount,
  );
  if (!nameRecord || !nameRecord.parentName) return "";

  const parentNameRecord = await NameRecordHeader.fromAccountAddress(
    connection,
    nameRecord.parentName,
  );
  if (!parentNameRecord || !parentNameRecord.owner) return "";

  const domain = await ans.reverseLookupNameAccount(
    nameAccount,
    parentNameRecord.owner,
  );

  const tld = await ans.getTldFromParentAccount(nameRecord.parentName);
  return `${domain}${tld}`;
}
