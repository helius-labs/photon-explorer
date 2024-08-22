// Adapted from https://github.com/filtoor/cnft-spam-filter/blob/main/package/model.json

export interface TokenFrequency {
  [token: string]: number;
}

export interface CategoryData {
  tokens: TokenFrequency;
  size: number;
}

export interface SpamModel {
  spam: CategoryData;
  ham: CategoryData;
}

export const defaultModel: SpamModel = {
  spam: {
    tokens: {
      "5000": 2,
      jupiter: 2,
      this: 9,
      airdrop: 5,
      pass: 3,
      amount: 5,
      hours: 5,
      time: 12,
      left: 5,
      not_containsEmoji: 16,
      proofLengthImpossible: 6,
      not_imageContainsUrl: 3,
      "o(pe==ssqp": 2,
      raydium: 2,
      "6283.39": 2,
      tokens: 2,
      "($1863.73)": 2,
      "rayds.pro": 2,
      link: 11,
      tether: 2,
      solana: 2,
      usdt: 2,
      remember: 2,
      redeem: 2,
      within: 2,
      next: 2,
      days: 2,
      "you've": 8,
      been: 9,
      awarded: 8,
      voucher: 14,
      exclusive: 8,
      claim: 8,
      "link:": 2,
      "5,000": 2,
      containsEmoji: 3,
      imageContainsUrl: 16,
      not_proofLengthImpossible: 13,
      jito: 6,
      "1,429": 6,
      sjito: 6,
      available: 6,
      "here:": 6,
      "jitovoucher.org": 6,
      "*this": 6,
      valid: 6,
      "days,": 6,
      after: 6,
      period: 6,
      prize: 6,
      validation: 6,
      will: 6,
      "unavailable.": 6,
      "(wencla": 6,
      "25.000.000": 6,
      swen: 6,
    },
    size: 19,
  },
  ham: {
    tokens: {
      drop: 6,
      season: 3,
      common: 7,
      rarity: 10,
      not_containsEmoji: 18,
      not_proofLengthImpossible: 19,
      not_imageContainsUrl: 16,
      artist: 4,
      city: 2,
      format: 2,
      eyes: 5,
      background: 5,
      rare: 2,
      clothes: 3,
      earring: 2,
      mouth: 3,
      serra: 2,
      sate: 2,
      imageContainsUrl: 3,
      containsEmoji: 1,
    },
    size: 19,
  },
};
