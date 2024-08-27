import { ConfirmedSignatureInfo, Connection, PublicKey } from "@solana/web3.js";

export async function getSignaturesForAddress(
  address: string,
  limit: number,
  endpoint: string,
  before?: string,
): Promise<ConfirmedSignatureInfo[]> {
  //console.log("In fetchTxnSigs");
  const connection = new Connection(endpoint);
  const signatures = await connection.getSignaturesForAddress(
    new PublicKey(address),
    { limit, before },
  );
  //console.log("signatures:", signatures);
  return signatures;
}

export function getTransaction(signature: string, endpoint: string) {
  const connection = new Connection(endpoint);
  const data = connection.getParsedTransaction(signature);

  return data;
}
