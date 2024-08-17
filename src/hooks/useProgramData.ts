import { useCluster } from "@/providers/cluster-provider";
import { Connection, PublicKey, AccountInfo } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { ProgramDataType } from "@/types/securityTxt";

export const useProgramData = (programId: string) => {
  const { endpoint } = useCluster();
  const [programData, setProgramData] = useState<ProgramDataType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProgramData = async () => {
      try {
        const connection = new Connection(endpoint);
        const publicKey = new PublicKey(programId);
        const programAccount = await connection.getAccountInfo(publicKey);

        if (!programAccount) {
          throw new Error(`Program account not found for ${programId}`);
        }

        let dataAccount: AccountInfo<Buffer>;

        // Check if this is an upgradeable program
        if (programAccount.owner.equals(new PublicKey("BPFLoaderUpgradeab1e11111111111111111111111"))) {
          // For upgradeable programs, the main account doesn't actually contain the program code
          // Instead, it references a separate program data account that holds the actual code
          
          // Fetch the program data account
          const [programDataAddress] = PublicKey.findProgramAddressSync(
            [publicKey.toBuffer()],
            new PublicKey("BPFLoaderUpgradeab1e11111111111111111111111")
          );
          
          const programDataAccount = await connection.getAccountInfo(programDataAddress);
          
          if (!programDataAccount) {
            throw new Error(`Program Data account not found for ${programId}`);
          }

          dataAccount = programDataAccount;
        } else {
          // For non-upgradeable programs, the main account contains the program code
          dataAccount = programAccount;
        }

        const base64Data = Buffer.from(dataAccount.data).toString("base64");

        // Check if the resulting string is valid base64
        // This should always be true since we're converting the Buffer to a string
        // (I hate regex)
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
          throw new Error(`Invalid base64 encoding for program data of ${programId}`);
        }

        setProgramData({ data: [base64Data, "base64"] });
      } catch (err) {
        console.error("Error fetching program data: ", err);
        setError(
          err instanceof Error
            ? err
            : new Error(
                `An error occurred fetching program data for ${programId}`,
              ),
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgramData();
  }, [programId, endpoint]);

  return { programData, isLoading, error };
};