import {
  Circle,
  CircleAlert,
  CircleCheck,
  CircleDotDashed,
} from "lucide-react";

export const statuses = [
  {
    label: "Failed",
    value: false,
    icon: CircleAlert,
  },
  {
    label: "Success",
    value: true,
    icon: CircleCheck,
  },
];

export const compressions = [
  {
    label: "Yes",
    value: true,
    icon: CircleDotDashed,
  },
  {
    label: "No",
    value: false,
    icon: Circle,
  },
];

/**
 * There are 1-billion lamports in one SOL
 */
export const LAMPORTS_PER_SOL = 1000000000;

export const addressLookupTable: Record<string, string> = {
  "11111111111111111111111111111111": "System Program",
  AddressLookupTab1e1111111111111111111111111: "Address Lookup Table Program",
  ComputeBudget111111111111111111111111111111: "Compute Budget Program",
  Config1111111111111111111111111111111111111: "Config Program",
  Ed25519SigVerify111111111111111111111111111: "Ed25519 Sigverify Precompile",
  KeccakSecp256k11111111111111111111111111111: "Secp256k1 Sigverify Precompile",
  Stake11111111111111111111111111111111111111: "Stake Program",
  TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: "Token Program",
  TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb: "Token-2022 Program",
  Vote111111111111111111111111111111111111111: "Vote Program",
  BPFLoader1111111111111111111111111111111111: "Bpf Loader",
  BPFLoader2111111111111111111111111111111111: "Bpf Loader 2",
  BPFLoaderUpgradeab1e11111111111111111111111: "Bpf Upgradeable Loader",
  MoveLdr111111111111111111111111111111111111: "Move Loader",
  NativeLoader1111111111111111111111111111111: "Native Loader",
  "1NCHWmQ39XfQuRLgGihckNKXcm9LXbq5EnPVwPptLWy": "Elixir Launchpad",
  "22Y43yTVxuUkoRKdm9thyRhQ3SdgQS7c7kB6UNCiaczD": "Serum Swap",
  "2669GNmpdcRF2FmpjZmPtnpKD7L9tkFd92XSPEN85i45": "Solsea Mint",
  "27haf8L6oxUeXrHrgEgsexjSY5hbVUWEmvv9Nyxg8vQv": "Raydium Liquidity Pool V3",
  "2qGyiNeWyZxNdkvWHc2jT5qkCnYa1j1gDLSSUmyoWMh8": "Elixir",
  "4ckmDgGdxQoPDLUkDT3vHgSAkzA3QRdNq5ywwY4sUSJn": "Serum Dex Alt V1",
  "5PmpMzWjraf3kSsGEKtqdUsCoLhptg4yriZ17LKKdBBy": "Hdg Token",
  "5SKmrbAxnHV2sgqyDXkGrLrokZYtWWVEEk5Soed7VLVN": "Yawww",
  "5ZfZAwP2m93waazg8DkrrVmsupeiPEvaEHowiUP7UAbJ": "Solanart Global Offer",
  "617jbWo616ggkDxvW1Le8pV38XLbVSyWY8ae6QUmGBAU": "Solsea V1",
  "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8": "Raydium Liquidity Pool V4",
  "6MLxLqiXaaSUpkgMnWDTuejNZEz3kE7k2woyHGVFw319": "Crema Finance",
  "6NcdQ5WTnrPoMLbP4kvpLYa4YSwKqkNHRRE8XVf5hmv9": "Foxy Missions",
  "6Rqtt2h8dS6pHPGzqrmGtyhjCk3zpk795QcEwXJLfeLn": "Runner Token",
  "6VJpeYFy87Wuv4KvwqD5gyFBTkohqZTqs6LgbCJ8tDBA": "Degods Gem Bank",
  "72D3En8GQycjtunxf9mgyR8onzYdPqYFsKp4myUzhaRZ": "Foxy Coinflip",
  "7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT": "Uxd Token",
  "7t8zVJtPCFAqog1DcnB6Ku1AVKtWfHkCiPi1cAvcJyVF": "Digital Eyes",
  "8BYmYs3zsBhftNELJdiKsCN2WyCBbrTwXd6WG4AFPr6n": "Foxy Token Market",
  "8JnNWJ46yfdq8sKgT1Lk4G7VWkAA8Rhh7LhqgJ6WY41G": "Soli Token",
  "8guzmt92HbM7yQ69UJg564hRRX6N4nCdxWE5L6ENrA8P": "Foxy Swap",
  "9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP": "Orca Token Swap V2",
  "9ehXDD5bnhSpFVRf99veikjgq8VajtRH7e3D9aVPLqYd": "Foxy Raffle",
  "9iLH8T7zoWhY7sBmj1WK9ENbWdS1nL8n9wAxaeRitTa6": "Ush Token",
  "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin": "Serum Dex V3",
  AARTcKUzLYaWmK7D1otgyAoFn5vQqBiTrxjwrvjvsVJa: "Solsea V2",
  AMM55ShdkoGRB5jVYPjWziwk8m5MpwyDgsMWHaMSQWH6: "Aldrin Amm V1",
  ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx: "Atlas Token",
  AmK5g2XcyptVLCFESBCJqoSfwV3znGoVYQnqEnaAZKWn: "Exchange Art Instant Sale",
  ArAA6CZC123yMJLUe4uisBEgvfuw2WEvex9iFmFCYiXv: "Launch My Nft",
  BFCMkgg9eFSv54HKJZFD5RMG8kNR5eMAEWnAtfRTPCjU: "Bifrost Launchpad",
  BJ3jrUzddfuSrZHXSCxMUUQsjKEyLmuuyZebkcaFp2fg: "Serum Dex V1",
  BRwUybBWZJEin7HVeWBC7AueG1McDeY6v4esBwgryzKe: "Bsl Gem Bank",
  BbGozDEfDKJbqxkSDjcDLWdQfxeZnnoTgD5VhNXV7epn: "Foxy Marmalade",
  CJsLwbP1iu5DuUikHEJnLfANgKy6stB2uFgvBBHoyxwz: "Solanart",
  CMZYPASGWeTz7RNGHaRJfCq2XQ5pYK6nDvVQxzkH51zb: "Magic Eden Launchpad",
  CTMAxxk34HjKWxQ3QLZK1HpaLXmBveao3ESePXbiyfzh: "Cropper",
  CURVGoZn8zycx6FXwwevgBTB2gVvdbGTEpvMJDbgs2t4: "Aldrin Amm V2",
  DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ: "Dust Token",
  DeJBGdMFa1uynnnKiwrVioatTuHmNLpyFKnmB5kaFdzQ: "Phantom",
  DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1: "Orca Token Swap V1",
  Dooar9JkhdZ7J3LHN3A7YCuoGRUggXhQaG4kijfLGU2j: "Stepn",
  E1XRkj9fPF2NQUdoq41AHPqwMDHykYfn5PzBXAyDs7Be: "Elixir V2",
  EA15T2W45BJFm71XmB5VGcsiWGKZTNfnK6aCmE2Hb5eC: "English Auction",
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: "Usdc Token",
  EUqojwWA2rd19FZrzeBncJsm38Jm1hEhE3zsmX3bRc2o: "Serum Dex V2",
  EewxydAPCCVuNEyrVN68PuSYdQ7wKn27V9Gjeoi8dy3S: "Lifinity",
  FFAUags5SYJEioBUkPtKuArccNzcNgUubhssCH2jSbeH: "Foxy Auction",
  FLWRna1gxehQ9pSyZMzxfp4UhewvLPwuKfdUTgdZuMBY: "Flwr Token",
  FQzYycoqRjmZTgCcTTAkzceH2Ju8nzNLa5d78K3yAhVW: "Degods Gem Farm",
  FoXpJL1exLBJgHVvdSHNKyKu2xX2uatctH9qp6dLmfpP: "Foxy Stake",
  FoXyMu5xwXre7zEoSvzViRk3nGawHUp9kUh97y2NDhcq: "Foxy Token",
  Guard1JwRhJkVH6XZhzoYxeBVQe872VH6QggF4BWmS9g: "Candy Machine V3",
  H8sMJSCQxfKiFTCfDR3DUMLPwcRbM61LGFJ8N4dK3WjS: "Coinbase Shared Wallet",
  HUfVysibcL4u6EVoi4GsSDnV993tRX47ntoYH123q9AB: "Bsl Gem Farm",
  HYPERfwdTjyJ2SCaKHmpF2MtrXqWxrsotYDsTrshHWq8: "Hyperspace",
  HedgeEohwU6RqokrvPU4Hb6XKPub8NuKbnPmY7FoMMtN: "Hedge",
  JCFRaPv7852ESRwJJGRy2mysUMydXZgVVhrMLmExvmVp: "Foxy Citrus",
  JUP2jxvXaqu7NQY1GmNF4m1vodw12LVXYxbFL2uJvfo: "Jupiter V2",
  JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph: "Jupiter V3",
  JUP6i4ozu5ydDCnLiMogSckDPpbtr7BJ4FtzYWkb5Rk: "Jupiter V1",
  M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K: "Magic Eden V2",
  MEANeD3XDdUmNMsRGjASkSWdC8prLYsoRJ61pPeHctD: "Mean Token",
  MERLuDFBMmsHnsBPZw2sDQZHvXFMwp8EdjudcU2HKky: "Mercurial Stable Swap",
  MEisE1HzehtrDpAAT8PnLHjpSSkRYakotTuJRPjTpo8: "Magic Eden V1",
  PADWBS1VeV1LWsY6nciu6dRZjgSmUH2iPsUpHFVz7Wz: "Elixir Launchpad V2",
  PassBQMFvYtDmvo7k5S2GVn6quj6RmnLnVfqEZebVMf: "Atadia Token Mint Authority",
  RVKd61ztZW9GUwhRbbLoYVRE5Xf1B2tVscKqwZqXgEr: "Raydium Liquidity Pool V2",
  SCHAtsf8mbjyjiv4LkhLKutTf6JnZAbdJKFkXQNMFHZ: "Sencha Exchange",
  SHARKobtfF1bHhxD2eqftjHBdVSCbKo9JtgK71FhELP: "Sharky Fi",
  SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y: "Shdw Token",
  SMPLecH534NA9acpos4G6x7uf3LWbCAwZQE9e8ZekMu: "Squads",
  SSwapUtytfBdBn1b9NUGG6foMVPtcWgpRU32HToDUZr: "Saros Amm",
  SSwpMgqNDsyV7mAgN9ady4bDVu5ySjmmXejXvy2vLt1: "Step Finance Swap Program",
  SSwpkEEcbUqx4vtoEByFjSkhKdCT862DNVb52nZg1UZ: "Saber Stable Swap",
  So11111111111111111111111111111111111111112: "W Sol Token",
  TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN: "Tensor",
  YAkoNb6HKmSxQN9L8hiBE5tPJRsniSSMzND1boHmZxe: "Saber Exchange",
  ZETAx4NhMsyop6gVwH2E2RrAcDiuPs9ABkhLBEvBsb6: "Zeta",
  auctxRXPeJoc4817jDhf4HbjnhEcr1cCXenosMhK5R8: "Metaplex Auction",
  bankHHdqMuaaST4qQk6mkzxGeKPHWmqdgor6Gs8r88m: "Gem Bank",
  cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ: "Candy Machine V2",
  cndyAnrLdpjq1Ssp1z8xxDsB8dxe7u4HL5Nxi2K5WXZ: "Candy Machine V1",
  cysPXAjehMpVKUapzbMCCnpFxUFFryEWEaLgnb9NrR8: "Cykura",
  exAuvFHqXXbiLrM4ce9m1icwuSyXytRnfBkajukDFuB: "Exchange Art Auction",
  exofLDXJoFji4Qyf9jSAH59J4pp82UT5pmGgR6iT24Z: "Exchange Art Offer",
  farmL4xeBFVXJqtfxCzU9b28QACM7E2W2ctT6epAjvE: "Gem Farm",
  formn3hJtt8gvVKxpCfzCJGuoz6CNUFcULFZW18iTpC: "Form Function",
  hadeK9DLv9eA7ya5KCTqSvSvRZeJC3JgD5a9Y3CNbvu: "Hade Swap",
  hausS13jsjafwWwGqZTUQRmWyvyxn9EQpqMwV1PBBmk: "Metaplex Auction House",
  inL8PMVd6iiW3RCBJnr5AsrRN6nqr4BTrcNuQWQSkvY: "Invictus Token",
  metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s: "Token Metadata",
  mgr99QFMYByTqGPWmNqunV7vBLmWWXdSrHUfV8Jf3JM: "Cardinal Rent",
  mmm3XBJg5gk8XJxEKBvdgptZz6SgK4tXvn36sodowMc: "Magic Eden Global Bid",
  ocp4vWUzA2z2XMYJ3QhM9vWdyoyoQwAFJhRdVTbvo9E: "Open Creator Protocol",
  p1exdMJcjVao65QdewkaZRUnU6VPSXhus9n2GzWfh98: "Metaplex",
  poLisWXnNRwC6oBu1vHiuKQzFjGL4XDSu4g9qjz9qVk: "Polis Token",
  q4bpaRKw3fJB1AJBeeBaKv3TjYzWsmntLgnSB275YUb: "Trtls Token",
  stkBL96RZkjY5ine4TvPihGqW8UHJfch2cokjAPzV8i: "Cardinal Staking",
  vau1zxA2LbssAUEF7Gpw91zMM1LvXrvpzJtmZ58rPsn: "Token Vault",
  whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc: "Orca Whirlpools",
  C83cpRN6oaafjNgMQJvaYgAz592EP5wunKvbokeTKPLn: "Address Merkle Tree Program",
  HNjtNrjt6irUPYEgxhx2Vcs42koK9fxzm3aFLHVaaRWz:
    "Address Merkle Tree Queue Program",
  "3MtrKu5Mjgh3JqeE5PeRzw2Ld28XjFgbbph67E6UERSx":
    "Governance Authority Pda Program",
  Edo2YjXU5eE17CejPBkupPgFLcYuAX47pGZmM7s2hAkj: "Group Pda Program",
  "5bdFnXU47QjzGpzHfXnxcEi5WXyxzEAZzd1vrE39bf1W": "Merkle Tree Pubkey Program",
  "44J4oDXpjPAbzHCSc24q7NEiPekss4sAbLd8ka4gd9CZ":
    "Nullifier Queue Pubkey Program",
  ytwwVWhQUMoTKdirKmvEW5xCRVr4B2dJZnToiHtE2L2: "Registered Program Pda Program",
  "5QPEJ5zDsVou9FQS3KCauKswM3VwBEBu4dpL9xTqkWwN": "Account Compression Program",
  "6UqiSPd2mRCTTwkzhcs1M6DGYsqHWd5jiPueX3LwDMXQ":
    "Light Compressed Pda Program",
  "9sixVEthz2kMSKfeApZXHwuboT6DZuT6crAYJTciUCqE":
    "Light Compressed Token Program",
  noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV: "Noop Program",
};
