import { Idl as AnchorIdl } from '@coral-xyz/anchor';


export type IdlType =
  | string
  | {
      defined: string;
    }
  | {
      option: IdlType;
    }
  | {
      vec: IdlType;
    }
  | {
      array: [IdlType, number];
    }
  | any;

export interface IdlField {
  name: string;
  type: IdlType;
}

export interface IdlAccount {
  name: string;
  isMut: boolean;
  isSigner: boolean;
}

export interface IdlInstruction {
  name: string;
  accounts: (IdlAccount | { name: string; accounts: IdlAccount[] })[];
  args: IdlField[];
}

export interface IdlTypeDef {
  name: string;
  type: {
    kind: "struct" | "enum";
    fields?: IdlField[];
    variants?: { name: string }[];
  };
}

export interface CustomIdl {
  version: string;
  name: string;
  instructions: IdlInstruction[];
  types?: IdlTypeDef[];
}

export interface IdlParserProps {
  idl: AnchorIdl;
}