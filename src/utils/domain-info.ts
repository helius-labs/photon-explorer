import {
  NameRegistryState,
  getHashedNameSync,
  getNameAccountKeySync,
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
    const pubkey = getDomainKeySync(
      domain.slice(0, -4), // remove .sol
      undefined,
      SOL_TLD_AUTHORITY,
    );

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

// returns non empty wallet string if a given .sol domain is owned by a wallet
export async function getAnsDomainInfo(domain: string, connection: Connection) {
  try {
    const ans = new TldParser(connection);
    const owner = await ans.getOwnerFromDomainTld(domain);

    return owner
      ? {
          owner: owner.toBase58(),
        }
      : null;
  } catch {
    return null;
  }
}

export const hasDomainSyntax = (value: string) => {
  return value.length > 4 && value.substring(value.length - 4) === ".sol";
};

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
