import { Cluster } from "./cluster";

export enum PROGRAM_NAMES {
  // native built-ins
  ADDRESS_LOOKUP_TABLE = "Address Lookup Table Program",
  COMPUTE_BUDGET = "Compute Budget Program",
  CONFIG = "Config Program",
  STAKE = "Stake Program",
  SYSTEM = "System Program",
  VOTE = "Vote Program",

  // native precompiles
  SECP256K1 = "Secp256k1 SigVerify Precompile",
  ED25519 = "Ed25519 SigVerify Precompile",

  // spl
  ASSOCIATED_TOKEN = "Associated Token Program",
  ACCOUNT_COMPRESSION = "State Compression Program",
  FEATURE_PROPOSAL = "Feature Proposal Program",
  LENDING = "Lending Program",
  MEMO_1 = "Memo Program V1",
  MEMO = "Memo Program",
  NAME = "Name Service Program",
  STAKE_POOL = "Stake Pool Program",
  SWAP = "Swap Program",
  TOKEN = "Token Program",
  TOKEN_2022 = "Token-2022 Program",
  TOKEN_METADATA = "Token Metadata Program",
  TOKEN_VAULT = "Token Vault Program",

  // other
  ACUMEN = "Acumen Program",
  BANANA_GUN_ROUTER = "Banana Gun Router Program",
  BONFIDA_AUCTION = "Bonfida Auction Program",
  BONFIDA_NAME_SERVICE = "Bonfida Name Service Program",
  BONFIDA_NAME_TOKENIZER = "Bonfida Name Tokenizer Program",
  BREAK_SOLANA = "Break Solana Program",
  CHAINLINK_ORACLE = "Chainlink OCR2 Oracle Program",
  CHAINLINK_STORE = "Chainlink Store Program",
  CLOCKWORK_1 = "Clockwork Thread Program V1",
  CLOCKWORK_2 = "Clockwork Thread Program V2",
  CROPPER_WHIRLPOOL = "Cropper Whirlpool Program",
  DRIFT_V2 = "Drift V2 Program",
  DRIP = "Drip Program",
  FLUXBEAM = "FluxBeam Program",
  HELIUM_TREASURY_MANAGEMENT = "Helium Treasury Management Program",
  INVARIANT_SWAP = "Invariant Swap Program",
  JITO_TIP_DISTRIBUTION = "Jito Tip Distribution Program",
  JITO_TIP_PAYMENT = "Jito Tip Payment Program",
  JUPITER_AGGREGATOR_V1 = "Jupiter Aggregator V1",
  JUPITER_AGGREGATOR_V2 = "Jupiter Aggregator V2",
  JUPITER_AGGREGATOR_V3 = "Jupiter Aggregator V3",
  JUPITER_AGGREGATOR_V4 = "Jupiter Aggregator V4",
  JUPITER_AGGREGATOR_V6 = "Jupiter Aggregator V6",
  JUPITER_APE = "Jupiter Ape Program",
  JUPITER_DCA = "Jupiter DCA Program",
  JUPITER_GOVERNANCE = "Jupiter Governance Program",
  MAGIC_EDEN_NFT_MARKETPLACE = "Magic Eden NFT Marketplace",
  MAGIC_EDEN_V2 = "Magic Eden V2 Program",
  MANGO_GOVERNANCE = "Mango Governance Program",
  MANGO_ICO = "Mango ICO Program",
  MANGO_1 = "Mango Program V1",
  MANGO_2 = "Mango Program V2",
  MANGO_3 = "Mango Program V3",
  MARGINFI_V2 = "Marginfi V2 Program",
  MARINADE = "Marinade Staking Program",
  MERCURIAL = "Mercurial Stable Swap Program",
  METADAO_AMM = "MetaDAO AMM Program",
  METADAO_AUTOCRAT = "MetaDAO Autocrat Program",
  METADAO_AUTOCRAT_MIGRATOR = "MetaDAO Autocrat Migrator Program",
  METADAO_CONDITIONAL_VAULT = "MetaDAO Conditional Vault Program",
  METADAO_OPTIMISTIC_TIMELOCK = "MetaDAO Optimistic Timelock Program",
  METAPLEX = "Metaplex Program",
  METEORA_DLMM = "Meteora DLMM Program",
  METEORA_POOLS = "Meteora Pools Program",
  NFT_AUCTION = "NFT Auction Program",
  NFT_CANDY_MACHINE = "NFT Candy Machine Program",
  NFT_CANDY_MACHINE_V2 = "NFT Candy Machine Program V2",
  ORCA_SWAP_1 = "Orca Swap Program V1",
  ORCA_SWAP_2 = "Orca Swap Program V2",
  ORCA_AQUAFARM = "Orca Aquafarm Program",
  ORE_V1 = "Ore V1 Program",
  ORE_V2 = "Ore V2 Program",
  PHOENIX = "Phoenix Program",
  PORT = "Port Finance Program",
  PUMPFUN = "Pump.fun Program",
  PYTH_DEVNET = "Pyth Oracle Program",
  PYTH_TESTNET = "Pyth Oracle Program",
  PYTH_MAINNET = "Pyth Oracle Program",
  QUARRY_MERGE_MINE = "Quarry Merge Mine",
  QUARRY_MINE = "Quarry Mine",
  QUARRY_MINT_WRAPPER = "Quarry Mint Wrapper",
  QUARRY_REDEEMER = "Quarry Redeemer",
  QUARRY_REGISTRY = "Quarry Registry",
  RAYDIUM_AMM = "Raydium AMM Program",
  RAYDIUM_IDO = "Raydium IDO Program",
  RAYDIUM_LP_1 = "Raydium Liquidity Pool Program V1",
  RAYDIUM_LP_2 = "Raydium Liquidity Pool Program V2",
  RAYDIUM_STAKING = "Raydium Staking Program",
  RAYDIUM_CP_SWAP = "Raydium CP Swap",
  SABER_DECIMAL_WRAPPER = "Saber Decimal Wrapper Program",
  SABER_ROUTER = "Saber Router Program",
  SABER_SWAP = "Saber Stable Swap Program",
  SANCTUM_SINGLE_VALIDATOR_SPL_STAKE_POOL = "Sanctum Single Validator SPL Stake Pool Program",
  SANCTUM_MULTI_VALIDATOR_SPL_STAKE_POOL = "Sanctum Multi-Validator SPL Stake Pool Program",
  SANCTUM_ROUTER = "Sanctum Router Program",
  SANCTUM_UNSTAKE = "Sanctum Unstake Program",
  SERUM_1 = "Serum Dex Program V1",
  SERUM_2 = "Serum Dex Program V2",
  SERUM_3 = "Serum Dex Program V3",
  SERUM_SWAP = "Serum Swap Program",
  SERUM_POOL = "Serum Pool",
  SOLEND = "Solend Program",
  SOLIDO = "Lido for Solana Program",
  SQUADS_MULTISIG = "Squads MultiSig Program",
  STEP_SWAP = "Step Finance Swap Program",
  SWIM_SWAP = "Swim Swap Program",
  SWITCHBOARD = "Switchboard Oracle Program",
  TENSOR_CNFT = "Tensor cNFT Program",
  TENSOR_SWAP = "Tensor Swap Program",
  TENSOR_WHITELIST = "Tensor Whitelist Program",
  WORMHOLE = "Wormhole",
  WORMHOLE_CORE = "Wormhole Core Bridge",
  WORMHOLE_TOKEN = "Wormhole Token Bridge",
  WORMHOLE_NFT = "Wormhole NFT Bridge",
  SOLANART = "Solanart",
  SOLANART_GO = "Solanart - Global offers",
  STEPN_DEX = "STEPN Dex",
  OPENBOOK_DEX = "OpenBook Dex",
};

const ALL_CLUSTERS = [
  Cluster.Custom,
  Cluster.Devnet,
  Cluster.Testnet,
  Cluster.MainnetBeta,
];

const LIVE_CLUSTERS = [Cluster.Devnet, Cluster.Testnet, Cluster.MainnetBeta];

export const LOADER_IDS: { [key: string]: string } = {
  BPFLoader1111111111111111111111111111111111: "BPF Loader",
  BPFLoader2111111111111111111111111111111111: "BPF Loader 2",
  BPFLoaderUpgradeab1e11111111111111111111111: "BPF Upgradeable Loader",
  MoveLdr111111111111111111111111111111111111: "Move Loader",
  NativeLoader1111111111111111111111111111111: "Native Loader",
} as const;

export type LoaderName = (typeof LOADER_IDS)[keyof typeof LOADER_IDS];

export type ProgramInfo = {
  name: string;
  deployments: Cluster[];
};

export const PROGRAM_INFO_BY_ID: { [address: string]: ProgramInfo } = {
  "11111111111111111111111111111111": {
    deployments: ALL_CLUSTERS,
    name: PROGRAM_NAMES.SYSTEM,
  },
  "22Y43yTVxuUkoRKdm9thyRhQ3SdgQS7c7kB6UNCiaczD": {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.SERUM_SWAP,
  },
  "27haf8L6oxUeXrHrgEgsexjSY5hbVUWEmvv9Nyxg8vQv": {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.RAYDIUM_LP_2,
  },
  "2rHhojZ7hpu1zA91nvZmT8TqWWvMcKmmNBCr2mKTtMq4": {
    deployments: [Cluster.Devnet],
    name: PROGRAM_NAMES.WORMHOLE_NFT,
  },
  "3XXuUFfweXBwFgFfYaejLvZE4cGZiHgKiGfMtdxNzYmv": {
    deployments: [Cluster.MainnetBeta, Cluster.Devnet],
    name: PROGRAM_NAMES.CLOCKWORK_1,
  },
  "3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5": {
    deployments: [Cluster.Devnet],
    name: PROGRAM_NAMES.WORMHOLE_CORE,
  },
  "5ZfZAwP2m93waazg8DkrrVmsupeiPEvaEHowiUP7UAbJ": {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.SOLANART_GO,
  },
  "5fNfvyp5czQVX77yoACa3JJVEhdRaWjPuazuWgjhTqEH": {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.MANGO_2,
  },
  "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8": {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.RAYDIUM_AMM,
  },
  "7sPptkymzvayoSbLXzBsXEF8TSf3typNnAWkrKrDizNb": {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.MANGO_ICO,
  },
  "82yxjeMsvaURa4MbZZ7WZZHfobirZYkH1zF8fmeGtyaQ": {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.ORCA_AQUAFARM,
  },
  "8tfDNiaEyrV6Q1U4DEXrEigs9DoDtkugzFbybENEbCDz": {
    deployments: [Cluster.Testnet],
    name: PROGRAM_NAMES.PYTH_TESTNET,
  },
  "9HzJyW1qZsEiSfMUf6L2jo3CcTKAyBmSyKdwQeYisHrC": {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.RAYDIUM_IDO,
  },
  "9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP": {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.ORCA_SWAP_2,
  },
  "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin": {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.SERUM_3,
  },
  // spl
  ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL: {
    deployments: ALL_CLUSTERS,
    name: PROGRAM_NAMES.ASSOCIATED_TOKEN,
  },
  // native built-ins
  AddressLookupTab1e1111111111111111111111111: {
    deployments: ALL_CLUSTERS,
    name: PROGRAM_NAMES.ADDRESS_LOOKUP_TABLE,
  },
  BJ3jrUzddfuSrZHXSCxMUUQsjKEyLmuuyZebkcaFp2fg: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.SERUM_1,
  },
  BrEAK7zGZ6dM71zUDACDqJnekihmwF15noTddWTsknjC: {
    deployments: LIVE_CLUSTERS,
    name: PROGRAM_NAMES.BREAK_SOLANA,
  },
  // other
  C64kTdg1Hzv5KoQmZrQRcm2Qz7PkxtFBgw7EpFhvYn8W: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.ACUMEN,
  },
  CJsLwbP1iu5DuUikHEJnLfANgKy6stB2uFgvBBHoyxwz: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.SOLANART,
  },
  CLoCKyJ6DXBJqqu2VWx9RLbgnwwR6BMHHuyasVmfMzBh: {
    deployments: [Cluster.MainnetBeta, Cluster.Devnet],
    name: PROGRAM_NAMES.CLOCKWORK_2,
  },
  ComputeBudget111111111111111111111111111111: {
    deployments: ALL_CLUSTERS,
    name: PROGRAM_NAMES.COMPUTE_BUDGET,
  },
  Config1111111111111111111111111111111111111: {
    deployments: ALL_CLUSTERS,
    name: PROGRAM_NAMES.CONFIG,
  },
  CrX7kMhLC3cSsXJdT7JDgqrRVWGnUpX3gfEfxxU2NVLi: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.SOLIDO,
  },
  Crt7UoUR6QgrFrN7j8rmSQpUTNWNSitSwWvsWGf1qZ5t: {
    deployments: [Cluster.Devnet, Cluster.MainnetBeta],
    name: PROGRAM_NAMES.SABER_ROUTER,
  },
  DZnkkTmCiFWfYTfT41X3Rd1kDgozqzxWaHqsw6W4x2oe: {
    deployments: [Cluster.Devnet],
    name: PROGRAM_NAMES.WORMHOLE_TOKEN,
  },
  DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.ORCA_SWAP_1,
  },
  Dooar9JkhdZ7J3LHN3A7YCuoGRUggXhQaG4kijfLGU2j: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.STEPN_DEX,
  },
  DtmE9D2CSB4L5D6A15mraeEjrGMm6auWVzgaD8hK2tZM: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.SWITCHBOARD,
  },
  EUqojwWA2rd19FZrzeBncJsm38Jm1hEhE3zsmX3bRc2o: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.SERUM_2,
  },
  Ed25519SigVerify111111111111111111111111111: {
    deployments: ALL_CLUSTERS,
    name: PROGRAM_NAMES.ED25519,
  },
  EhhTKczWMGQt46ynNeRX1WfeagwwJd7ufHvCDjRxjo5Q: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.RAYDIUM_STAKING,
  },
  CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.RAYDIUM_CP_SWAP,
  },
  Feat1YXHhH6t1juaWF74WLcfv4XoNocjXA6sPWHNgAse: {
    deployments: ALL_CLUSTERS,
    name: PROGRAM_NAMES.FEATURE_PROPOSAL,
  },
  FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.PYTH_MAINNET,
  },
  GqTPL6qRf5aUuqscLh8Rg2HTxPUXfhhAXDptTLhp1t2J: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.MANGO_GOVERNANCE,
  },
  HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny: {
    deployments: [Cluster.Devnet, Cluster.MainnetBeta],
    name: PROGRAM_NAMES.CHAINLINK_STORE,
  },
  JD3bq9hGdy38PuWQ4h2YJpELmHVGPPfFSuFkpzAd9zfu: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.MANGO_1,
  },
  KeccakSecp256k11111111111111111111111111111: {
    deployments: ALL_CLUSTERS,
    name: PROGRAM_NAMES.SECP256K1,
  },
  LendZqTs7gn5CTSJU1jWKhKuVpjJGom45nnwPb2AMTi: {
    deployments: LIVE_CLUSTERS,
    name: PROGRAM_NAMES.LENDING,
  },
  MERLuDFBMmsHnsBPZw2sDQZHvXFMwp8EdjudcU2HKky: {
    deployments: [Cluster.Devnet, Cluster.MainnetBeta],
    name: PROGRAM_NAMES.MERCURIAL,
  },
  MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.MARINADE,
  },
  Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo: {
    deployments: ALL_CLUSTERS,
    name: PROGRAM_NAMES.MEMO_1,
  },
  MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr: {
    deployments: ALL_CLUSTERS,
    name: PROGRAM_NAMES.MEMO,
  },
  Port7uDYB3wk6GJAw4KT1WpTeMtSu9bTcChBHkX2LfR: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.PORT,
  },
  QMMD16kjauP5knBwxNUJRZ1Z5o3deBuFrqVjBVmmqto: {
    deployments: LIVE_CLUSTERS,
    name: PROGRAM_NAMES.QUARRY_MERGE_MINE,
  },
  QMNeHCGYnLVDn1icRAfQZpjPLBNkfGbSKRB83G5d8KB: {
    deployments: LIVE_CLUSTERS,
    name: PROGRAM_NAMES.QUARRY_MINE,
  },
  QMWoBmAyJLAsA1Lh9ugMTw2gciTihncciphzdNzdZYV: {
    deployments: LIVE_CLUSTERS,
    name: PROGRAM_NAMES.QUARRY_MINT_WRAPPER,
  },
  QRDxhMw1P2NEfiw5mYXG79bwfgHTdasY2xNP76XSea9: {
    deployments: LIVE_CLUSTERS,
    name: PROGRAM_NAMES.QUARRY_REDEEMER,
  },
  QREGBnEj9Sa5uR91AV8u3FxThgP5ZCvdZUW2bHAkfNc: {
    deployments: LIVE_CLUSTERS,
    name: PROGRAM_NAMES.QUARRY_REGISTRY,
  },
  RVKd61ztZW9GUwhRbbLoYVRE5Xf1B2tVscKqwZqXgEr: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.RAYDIUM_LP_1,
  },
  SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy: {
    deployments: LIVE_CLUSTERS,
    name: PROGRAM_NAMES.STAKE_POOL,
  },
  SSwpMgqNDsyV7mAgN9ady4bDVu5ySjmmXejXvy2vLt1: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.STEP_SWAP,
  },
  SSwpkEEcbUqx4vtoEByFjSkhKdCT862DNVb52nZg1UZ: {
    deployments: [Cluster.Devnet, Cluster.MainnetBeta],
    name: PROGRAM_NAMES.SABER_SWAP,
  },
  SWiMDJYFUGj6cPrQ6QYYYWZtvXQdRChSVAygDZDsCHC: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.SWIM_SWAP,
  },
  So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.SOLEND,
  },
  Stake11111111111111111111111111111111111111: {
    deployments: ALL_CLUSTERS,
    name: PROGRAM_NAMES.STAKE,
  },
  SwaPpA9LAaLfeLi3a68M4DjnLqgtticKg6CnyNwgAC8: {
    deployments: LIVE_CLUSTERS,
    name: PROGRAM_NAMES.SWAP,
  },
  TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: {
    deployments: ALL_CLUSTERS,
    name: PROGRAM_NAMES.TOKEN,
  },
  TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb: {
    deployments: ALL_CLUSTERS,
    name: PROGRAM_NAMES.TOKEN_2022,
  },
  Vote111111111111111111111111111111111111111: {
    deployments: ALL_CLUSTERS,
    name: PROGRAM_NAMES.VOTE,
  },
  WnFt12ZrnzZrFZkt2xsNsaNWoQribnuQ5B5FrDbwDhD: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.WORMHOLE_NFT,
  },
  WormT3McKhFJ2RkiGpdw9GKvNCrB2aB54gb2uV9MfQC: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.WORMHOLE,
  },
  WvmTNLpGMVbwJVYztYL4Hnsy82cJhQorxjnnXcRm3b6: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.SERUM_POOL,
  },
  auctxRXPeJoc4817jDhf4HbjnhEcr1cCXenosMhK5R8: {
    deployments: LIVE_CLUSTERS,
    name: PROGRAM_NAMES.NFT_AUCTION,
  },
  cjg3oHmg9uuPsP8D6g29NWvhySJkdYdAo9D25PRbKXJ: {
    deployments: [Cluster.Devnet, Cluster.MainnetBeta],
    name: PROGRAM_NAMES.CHAINLINK_ORACLE,
  },
  cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK: {
    deployments: [Cluster.Devnet, Cluster.MainnetBeta],
    name: PROGRAM_NAMES.ACCOUNT_COMPRESSION,
  },
  cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ: {
    deployments: LIVE_CLUSTERS,
    name: PROGRAM_NAMES.NFT_CANDY_MACHINE_V2,
  },
  cndyAnrLdpjq1Ssp1z8xxDsB8dxe7u4HL5Nxi2K5WXZ: {
    deployments: LIVE_CLUSTERS,
    name: PROGRAM_NAMES.NFT_CANDY_MACHINE,
  },
  gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s: {
    deployments: [Cluster.Devnet],
    name: PROGRAM_NAMES.PYTH_DEVNET,
  },
  metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s: {
    deployments: LIVE_CLUSTERS,
    name: PROGRAM_NAMES.TOKEN_METADATA,
  },
  mv3ekLzLbnVPNxjSKvqBpU3ZeZXPQdEC3bp5MDEBG68: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.MANGO_3,
  },
  namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX: {
    deployments: LIVE_CLUSTERS,
    name: PROGRAM_NAMES.NAME,
  },
  p1exdMJcjVao65QdewkaZRUnU6VPSXhus9n2GzWfh98: {
    deployments: LIVE_CLUSTERS,
    name: PROGRAM_NAMES.METAPLEX,
  },
  srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.OPENBOOK_DEX,
  },
  vau1zxA2LbssAUEF7Gpw91zMM1LvXrvpzJtmZ58rPsn: {
    deployments: LIVE_CLUSTERS,
    name: PROGRAM_NAMES.TOKEN_VAULT,
  },
  worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.WORMHOLE_CORE,
  },
  wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.WORMHOLE_TOKEN,
  },
  PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.PHOENIX,
  },
  SMPLecH534NA9acpos4G6x7uf3LWbCAwZQE9e8ZekMu: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.SQUADS_MULTISIG,
  },
  dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.DRIFT_V2,
  },
  MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.MARGINFI_V2,
  },
  TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.TENSOR_SWAP,
  },
  TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.TENSOR_CNFT,
  },
  TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.TENSOR_WHITELIST,
  },
  oreV2ZymfyeXgNgBdqMkumTqqAprVqgBWQfoYkrtKWQ: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.ORE_V2,
  },
  mineRHF5r6S7HyD9SppBfVMXMavDkJsxwGesEvxZr2A: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.ORE_V1,
  },
  M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.MAGIC_EDEN_V2,
  },
  MEisE1HzehtrDpAAT8PnLHjpSSkRYakotTuJRPjTpo8: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.MAGIC_EDEN_NFT_MARKETPLACE,
  },
  dripTrkvSyQKvkyWg7oi4jmeEGMA5scSYowHArJ9Vwk: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.DRIP,
  },
  SP12tWFxD9oJsVWNavTTBZvMbA6gkAmxtVgxdqvyvhY: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.SANCTUM_SINGLE_VALIDATOR_SPL_STAKE_POOL,
  },
  SPMBzsVUuoHA4Jm6KunbsotaahvVikZs1JyTW6iJvbn: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.SANCTUM_MULTI_VALIDATOR_SPL_STAKE_POOL,
  },
  unpXTU2Ndrc7WWNyEhQWe4udTzSibLPi25SXv2xbCHQ: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.SANCTUM_UNSTAKE,
  },
  stkitrT1Uoy18Dk1fTrgPw8W6MVzoCfYoAFT4MLsmhq: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.SANCTUM_ROUTER,
  },
  jCebN34bUfdeUYJT13J1yG16XWQpt5PDx6Mse9GUqhR: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.BONFIDA_NAME_SERVICE,
  },
  AVWV7vdWbLqXiLKFaP19GhYurhwxaLp2qRBSjT5tR5vT: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.BONFIDA_AUCTION,
  },
  nftD3vbNkNqfj2Sd3HZwbpw4BxxKWr4AjGb9X38JeZk: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.BONFIDA_NAME_TOKENIZER,
  },
  JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.JUPITER_AGGREGATOR_V6,
  },
  JSWX3pKDbj2EdCMu4ei7sPYSpdcwZNyjkDSteoHQ4UH: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.JUPITER_APE,
  },
  GovaE4iu227srtG2s3tZzB4RmWBzw8sTwrCLZz7kN7rY: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.JUPITER_GOVERNANCE,
  },
  DCA265Vj8a9CEuX1eb1LWRnDT7uK6q1xMipnNyatn23M: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.JUPITER_DCA,
  },
  JUP6i4ozu5ydDCnLiMogSckDPpbtr7BJ4FtzYWkb5Rk: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.JUPITER_AGGREGATOR_V1,
  },
  JUP2jxvXaqu7NQY1GmNF4m1vodw12LVXYxbFL2uJvfo: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.JUPITER_AGGREGATOR_V2,
  },
  JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.JUPITER_AGGREGATOR_V3,
  },
  JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.JUPITER_AGGREGATOR_V4,
  },
  T1pyyaTNZsKv2WcRAB8oVnk93mLJw2XzjtVYqCsaHqt: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.JITO_TIP_PAYMENT,
  },
  "4R3gSG8BpU4t19KYj8CfnbtRpnT8gtk4dvTHxVRwc2r7": {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.JITO_TIP_DISTRIBUTION,
  },
  autoQP9RmUNkzzKRXsMkWicDVZ3h29vvyMDcAYjCxxg: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.METADAO_AUTOCRAT,
  },
  AMM5G2nxuKUwCLRYTW7qqEwuoqCtNSjtbipwEmm2g8bH: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.METADAO_AMM,
  },
  MigRDW6uxyNMDBD8fX2njCRyJC4YZk2Rx9pDUZiAESt: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.METADAO_AUTOCRAT_MIGRATOR
  },
  VAU1T7S5UuEHmMvXtXMVmpEoQtZ2ya7eRb7gcN47wDp: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.METADAO_CONDITIONAL_VAULT
  },
  tiME1hz9F5C5ZecbvE5z6Msjy8PKfTqo1UuRYXfndKF: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.METADAO_OPTIMISTIC_TIMELOCK,
  },
  "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P": {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.PUMPFUN,
  },
  LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.METEORA_DLMM,
  },
  Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.METEORA_POOLS,
  },
  treaf4wWBBty3fHdyBpo35Mz84M8k3heKXmjmi9vFt5: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.HELIUM_TREASURY_MANAGEMENT,
  },
  FLUXubRmkEi2q6K3Y9kBPg9248ggaZVsoSFhtJHSrm1X: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.FLUXBEAM,
  },
  DecZY86MU5Gj7kppfUCEmd4LbXXuyZH1yHaP2NTqdiZB: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.SABER_DECIMAL_WRAPPER,
  },
  H8W3ctz92svYg6mkn1UtGfu2aQr2fnUFHM1RhScEtQDt: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.CROPPER_WHIRLPOOL,
  },
  HyaB3W9q6XdA5xwpU4XnSZV94htfmbmqJXZcEbRaJutt: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.INVARIANT_SWAP,
  },
  BANANAjs7FJiPQqJTGFzkZJndT9o7UmKiYYGaJz6frGu: {
    deployments: [Cluster.MainnetBeta],
    name: PROGRAM_NAMES.BANANA_GUN_ROUTER,
  }
};

export const SPECIAL_IDS: { [key: string]: string } = {
  "1nc1nerator11111111111111111111111111111111": "Incinerator",
  Sysvar1111111111111111111111111111111111111: "SYSVAR",
  he1iusunGwqrNtafDtLdhsUQDFvo13z9sUa36PauBtk: "Helius Validator",
};

export const SYSVAR_IDS: { [key: string]: string } = {
  Sysvar1nstructions1111111111111111111111111: "Sysvar: Instructions",
  SysvarC1ock11111111111111111111111111111111: "Sysvar: Clock",
  SysvarEpochSchedu1e111111111111111111111111: "Sysvar: Epoch Schedule",
  SysvarFees111111111111111111111111111111111: "Sysvar: Fees",
  SysvarRecentB1ockHashes11111111111111111111: "Sysvar: Recent Blockhashes",
  SysvarRent111111111111111111111111111111111: "Sysvar: Rent",
  SysvarRewards111111111111111111111111111111: "Sysvar: Rewards",
  SysvarS1otHashes111111111111111111111111111: "Sysvar: Slot Hashes",
  SysvarS1otHistory11111111111111111111111111: "Sysvar: Slot History",
  SysvarStakeHistory1111111111111111111111111: "Sysvar: Stake History",
};

export const TOKEN_IDS: { [key: string]: string } = {
  TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: "Token Program",
  TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb: "Token-2022 Program",
} as const;

export const ZK_COMPRESSION_IDS: { [key: string]: string } = {
  C83cpRN6oaafjNgMQJvaYgAz592EP5wunKvbokeTKPLn: "Address Merkle Tree Program",
  HNjtNrjt6irUPYEgxhx2Vcs42koK9fxzm3aFLHVaaRWz:
    "Address Merkle Tree Queue Program",
  "3MtrKu5Mjgh3JqeE5PeRzw2Ld28XjFgbbph67E6UERSx":
    "Governance Authority PDA Program",
  Edo2YjXU5eE17CejPBkupPgFLcYuAX47pGZmM7s2hAkj: "Group PDA Program",
  "5bdFnXU47QjzGpzHfXnxcEi5WXyxzEAZzd1vrE39bf1W": "Merkle Tree Pubkey Program",
  "44J4oDXpjPAbzHCSc24q7NEiPekss4sAbLd8ka4gd9CZ":
    "Nullifier Queue Pubkey Program",
  ytwwVWhQUMoTKdirKmvEW5xCRVr4B2dJZnToiHtE2L2: "Registered Program PDA Program",
  "5QPEJ5zDsVou9FQS3KCauKswM3VwBEBu4dpL9xTqkWwN": "Account Compression Program",
  "6UqiSPd2mRCTTwkzhcs1M6DGYsqHWd5jiPueX3LwDMXQ":
    "Light Compressed PDA Program",
  "9sixVEthz2kMSKfeApZXHwuboT6DZuT6crAYJTciUCqE":
    "Light Compressed Token Program",
  noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV: "Noop Program",
  H5sFv8VwWmjxHYS2GB4fTDsK7uTtnRT4WiixtHrET3bN: "Light Program",
  CbjvJc1SNx1aav8tU49dJGHu8EUdzQJSMtkjDmV8miqK: "Account Compression Program",
  "6ggPeeNVyMaQTzVLxaEBVY74C3GCExbB1F9331EreoGJ": "Compressed SOL Pool",
} as const;

export type TokenProgram = "spl-token" | "spl-token-2022";
export function assertIsTokenProgram(
  program: string,
): asserts program is TokenProgram {
  if (program !== "spl-token" && program !== "spl-token-2022")
    throw new Error(
      "Expected token program name of `spl-token` or `spl-token-2022`",
    );
}
export function isTokenProgram(program: string): program is TokenProgram {
  try {
    assertIsTokenProgram(program);
    return true;
  } catch (e) {
    return false;
  }
}
