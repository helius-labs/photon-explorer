import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";

import { useGetTokensByMint } from "@/hooks/useGetTokensByMint";

const supportedPythSymbols = [
  "BRENT1M", "BRENT2M", "BRENT3M", "USOILSPOT", "WTI1M", "WTI2M", "WTI3M",
  "1INCH", "AAVE", "ACM", "ADA", "AERO", "AEVO", "AFSUI", "AGEUR", "AKT", 
  "ALEX", "ALGO", "ALICE", "ALPACA", "ALT", "AMB", "AMP", "ANKR", "APE", 
  "API3", "APT", "AR", "ARB", "ARG", "ARKM", "ASR", "ASTR", "ASTRO", "ATH", 
  "ATLAS", "ATM", "ATOM", "AUDIO", "AURORA", "AURY", "AUSD", "AVAIL", 
  "AVAX", "AXL", "AXS", "BAL", "BAND", "BAR", "BAT", "BCH", "BEAM", "BETH", 
  "BGB", "BIFI", "BITCOIN", "BLAST", "BLUR", "BLZE", "BNB", "BOBA", "BODEN", 
  "BOME", "BONK", "BORG", "BRZ", "BSOL", "BSV", "BSW", "BTC", "BTT", "BUCK", 
  "BUSD", "C98", "CAKE", "CANTO", "CAW", "CBETH", "CELO", "CELR", "CETUS", 
  "CFX", "CHR", "CHZ", "CITY", "COMP", "COQ", "CORE", "COW", "CRO", "CRV", 
  "CSPR", "CTSI", "CUSD", "CVX", "DAI", "DAR", "DASH", "DEGEN", "DEUSD", 
  "DODO", "DOGE", "DOT", "DRIFT", "DYDX", "DYM", "EDU", "EETH", "EGLD", 
  "EIGEN", "ELON", "ENA", "ENJ", "ENS", "EOS", "ERN", "ETC", "ETH", "ETHFI", 
  "EURA", "EURC", "EUROE", "EURS", "EVMOS", "EZETH", "FDUSD", "FIDA", 
  "FIL", "FLOKI", "FLOW", "FRAX", "FRIEND", "FRXETH", "FTM", "FTT", "FUD", 
  "FXS", "G", "GALA", "GHO", "GLMR", "GMT", "GMX", "GNO", "GNS", "GOFX", 
  "GRAIL", "GRT", "GT", "GUI", "GUSD", "HASUI", "HBAR", "HFT", "HNT", "HT", 
  "HXRO", "ICP", "IDEX", "ILV", "IMX", "INF", "INJ", "INTER", "IO", "IOT", 
  "IOTA", "IOTX", "ITA", "Index.GMCI30", "Index.GML2", "Index.GMMEME", 
  "Index.GMSOL", "JITOSOL", "JLP", "JOE", "JTO", "JUP", "JUV", "KAS", 
  "KAVA", "KCS", "KLAY", "KMNO", "KNC", "KSM", "LDO", "LEO", "LINK", "LIS", 
  "LL", "LOOKS", "LQTY", "LRC", "LST", "LTC", "LUNA", "LUNC", "LUSD", "LVN", 
  "LYVE", "MAGA", "MANA", "MANEKI", "MANTA", "MASK", "MATIC", "MAV", 
  "MBOX", "MBTC", "MEAN", "MEME", "MERL", "METH", "METIS", "MEW", "MICHI", 
  "MIM", "MINA", "MIR", "MKR", "MNDE", "MNGO", "MNT", "MOBILE", "MOD", 
  "MODE", "MOG", "MSOL", "MTR", "MTRG", "MUSD", "MYRO", "NAVX", "NEAR", 
  "NEON", "NOT", "NTRN", "OG", "OKB", "OMG", "OMI", "ONDO", "ONE", "OP", 
  "ORCA", "ORDI", "OSMO", "OUSD", "PAXG", "PENDLE", "PEOPLE", "PEPE", 
  "PERP", "POL", "POPCAT", "POR", "PORT", "PRCL", "PRIME", "PSG", "PUFETH", 
  "PXETH", "PYTH", "PYUSD", "QNT", "QTUM", "QUICK", "RACA", "RAY", "RDNT", 
  "RENDER", "RETH", "REZ", "RLB", "RON", "ROSE", "RPL", "RSETH", "RSR", 
  "RSWETH", "RUNE", "SAFE", "SAMO", "SAND", "SATS", "SAUCE", "SBR", "SCA", 
  "SCRT", "SD", "SDAI", "SEAM", "SEI", "SEIYAN", "SFRXETH", "SHDW", "SHIB", 
  "SKL", "SLERF", "SLISBNB", "SLND", "SLP", "SMR", "SNX", "SOL", "SPA", 
  "SPELL", "STAPT", "STATOM", "STBT", "STETH", "STG", "STHAPT", "STKBNB", 
  "STNEAR", "STONE", "STORJ", "STRD", "STRK", "STSOL", "STTIA", "STX", 
  "SUI", "SUSDE", "SUSHI", "SWEAT", "SWETH", "SXP", "SYN", "TAIKO", "TAO", 
  "TAPT", "TBTC", "TENET", "THAPT", "THETA", "THL", "TIA", "TNSR", "TOKEN", 
  "TON", "TRB", "TRUMATIC", "TRX", "TURBOS", "TUSD", "TWT", "UMA", "UNI", 
  "USDA", "USDB", "USDC", "USDD", "USDE", "USDM", "USDP", "USDT", "USDV", 
  "USDY", "USTC", "UXD", "VCHF", "VELA", "VET", "VEUR", "VIC", "VSUI", 
  "W", "WAVES", "WBETH", "WBTC", "WEETH", "WEMIX", "WEN", "WETH", "WIF", 
  "WLD", "WOJAK", "WOM", "WOO", "WSTETH", "XAI", "XAUT", "XDC", "XEC", 
  "XLM", "XMR", "XPRT", "XRD", "XRP", "XTZ", "YES", "YFI", "ZEC", "ZEN", 
  "ZERO", "ZETA", "ZEUS", "ZEX", "ZIL", "ZK", "ZKF", "ZRO", "FR.C3M", 
  "GB.CSPX", "GB.IB01", "GB.IBTA", "IE.EUE", "NL.BCOIN", "AAPL", "AI", 
  "AMC", "AMGN", "AMZN", "ARKB", "ARKK", "AXP", "BA", "BITB", "BITS", "BLK", 
  "BRRR", "BTCO", "BTCW", "BTF", "CAT", "COIN", "CPNG", "CRM", "CSCO", 
  "CVX", "DEFI", "DIA", "DIS", "DOW", "EEM", "EFA", "EZBC", "FBTC", "GBTC", 
  "GE", "GLD", "GME", "GOOG", "GOVT", "GS", "HD", "HODL", "HON", "HYG", 
  "IBIT", "IBM", "INTC", "IVV", "IWM", "JNJ", "JPM", "KO", "MARA", "MCD", 
  "META", "MINT", "MMM", "MRK", "MSFT", "MSTR", "NFLX", "NKE", "NVDA", 
  "PG", "QQQ", "RIOT", "SHV", "SPY", "TLT", "TRV", "TSLA", "UNH", "USFR", 
  "USO", "V", "VOO", "VZ", "WBA", "WMT", "XLE", "AUD", "EUR", "GBP", "NZD", 
  "BRL", "CAD", "CHF", "CNH", "HKD", "JPY", "MXN", "NOK", "SEK", "SGD", 
  "ZAR", "XAG", "XAU", "US10Y", "US1M", "US2Y", "US30Y", "US3M", "US5Y", 
  "US6M", "US7Y",
]; 

export function usePythDataFeed(address: string | null) {
  const [hasPythDataFeed, setHasPythDataFeed] = useState(false);

  const publicKey = address ? new PublicKey(address) : null;
  const {
    data: tokenData,
    isLoading,
    isError,
    error,
  } = useGetTokensByMint(publicKey?.toBase58() || "", !!address);

  useEffect(() => {
    if (!isLoading && !isError && tokenData) {
      
      // Check if the token symbol is in the list of known Pyth-supported tokens
      const pythDataFeedExists = tokenData.symbol
        ? supportedPythSymbols.includes(tokenData.symbol.toUpperCase())
        : false;

      setHasPythDataFeed(pythDataFeedExists);
    } else if (isError) {
      console.error("", error);
    }
  }, [tokenData, isLoading, isError, error]);

  return { hasPythDataFeed, isLoading, isError };
}
