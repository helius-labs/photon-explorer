import {
  AccountCompressionIDL,
  LightSystemIDL,
} from "@lightprotocol/stateless.js";
import { PublicKey } from "@solana/web3.js";
import {
  ParserOutput,
  ParserType,
  SolanaFMParser,
  checkIfInstructionParser,
} from "@solanafm/explorer-kit";
import { IdlItem, getProgramIdl } from "@solanafm/explorer-kit-idls";

export async function parseInstructions(
  programId: PublicKey,
  data: string,
): Promise<string> {
  let SFMIdlItem: IdlItem | null = null;

  if (programId.toBase58() === "H5sFv8VwWmjxHYS2GB4fTDsK7uTtnRT4WiixtHrET3bN") {
    SFMIdlItem = {
      programId: programId.toBase58(),
      idl: LightSystemIDL,
      idlType: "anchor",
      idlSlotVersion: undefined,
      chainId: undefined,
    };
  } else if (
    programId.toBase58() === "CbjvJc1SNx1aav8tU49dJGHu8EUdzQJSMtkjDmV8miqK"
  ) {
    SFMIdlItem = {
      programId: programId.toBase58(),
      idl: AccountCompressionIDL,
      idlType: "anchor",
      idlSlotVersion: undefined,
      chainId: undefined,
    };
  } else {
    SFMIdlItem = await getProgramIdl(programId.toBase58());
  }

  if (SFMIdlItem) {
    try {
      const parser = new SolanaFMParser(SFMIdlItem, programId.toBase58());
      const instructionParser = parser.createParser(ParserType.INSTRUCTION);

      if (instructionParser && checkIfInstructionParser(instructionParser)) {
        return JSON.stringify(
          instructionParser.parseInstructions(data),
          null,
          4,
        );
      }
    } catch (e) {
      return data;
    }
  }

  return data;
}
