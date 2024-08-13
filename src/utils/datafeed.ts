import { subscribeOnStream, unsubscribeFromStream } from "./streaming";

const API_ENDPOINT = "https://benchmarks.pyth.network/v1/shims/tradingview";

// Use it to keep a record of the most recent bar on the chart
const lastBarsCache = new Map<string, Bar>();

interface Bar {
  time: number;
  low: number;
  high: number;
  open: number;
  close: number;
}

interface ConfigurationData {
  supports_search: boolean;
  supports_group_request: boolean;
  supported_resolutions: string[];
  supports_marks: boolean;
  supports_timescale_marks: boolean;
  supports_time: boolean;
}

interface SymbolInfo {
  ticker: string;
  name: string;
  description: string;
  type: string;
  session: string;
  timezone: string;
  exchange: string;
  minmov: number;
  pricescale: number;
  has_intraday: boolean;
  supported_resolutions: string[];
  volume_precision: number;
  data_status: string;
}

interface PeriodParams {
  from: number;
  to: number;
  firstDataRequest: boolean;
}

interface HistoryCallbackOptions {
  noData: boolean;
}

interface Datafeed {
  onReady: (callback: (data: ConfigurationData) => void) => void;
  searchSymbols: (
    userInput: string,
    exchange: string,
    symbolType: string,
    onResultReadyCallback: (data: SymbolInfo[]) => void,
  ) => void;
  resolveSymbol: (
    symbolName: string,
    onSymbolResolvedCallback: (symbolInfo: SymbolInfo) => void,
    onResolveErrorCallback: (error: string) => void,
  ) => void;
  getBars: (
    symbolInfo: SymbolInfo,
    resolution: string,
    periodParams: PeriodParams,
    onHistoryCallback: (bars: Bar[], options: HistoryCallbackOptions) => void,
    onErrorCallback: (error: string) => void,
  ) => void;
  subscribeBars: (
    symbolInfo: SymbolInfo,
    resolution: string,
    onRealtimeCallback: (bar: Bar) => void,
    subscriberUID: string,
    onResetCacheNeededCallback: () => void,
  ) => void;
  unsubscribeBars: (subscriberUID: string) => void;
}

const datafeed: Datafeed = {
  onReady: (callback) => {
    console.log("[onReady]: Method call");
    fetch(`${API_ENDPOINT}/config`)
      .then((response) => response.json())
      .then((configurationData: ConfigurationData) => {
        setTimeout(() => callback(configurationData), 0);
      });
  },
  searchSymbols: (userInput, exchange, symbolType, onResultReadyCallback) => {
    console.log("[searchSymbols]: Method call");
    fetch(`${API_ENDPOINT}/search?query=${userInput}`)
      .then((response) => response.json())
      .then((data: SymbolInfo[]) => {
        onResultReadyCallback(data);
      });
  },
  resolveSymbol: (
    symbolName,
    onSymbolResolvedCallback,
    onResolveErrorCallback,
  ) => {
    console.log("[resolveSymbol]: Method call", symbolName);
    fetch(`${API_ENDPOINT}/symbols?symbol=${symbolName}`)
      .then((response) => response.json())
      .then((symbolInfo: SymbolInfo) => {
        console.log("[resolveSymbol]: Symbol resolved", symbolInfo);
        onSymbolResolvedCallback(symbolInfo);
      })
      .catch((error) => {
        console.log("[resolveSymbol]: Cannot resolve symbol", symbolName);
        onResolveErrorCallback("Cannot resolve symbol");
      });
  },
  getBars: (
    symbolInfo,
    resolution,
    periodParams,
    onHistoryCallback,
    onErrorCallback,
  ) => {
    const { from, to, firstDataRequest } = periodParams;
    console.log("[getBars]: Method call", symbolInfo, resolution, from, to);

    const maxRangeInSeconds = 365 * 24 * 60 * 60; // 1 year in seconds

    const promises: Promise<any>[] = [];
    let currentFrom = from;
    let currentTo;

    while (currentFrom < to) {
      currentTo = Math.min(to, currentFrom + maxRangeInSeconds);
      const url = `${API_ENDPOINT}/history?symbol=${symbolInfo.ticker}&from=${currentFrom}&to=${currentTo}&resolution=${resolution}`;
      promises.push(fetch(url).then((response) => response.json()));
      currentFrom = currentTo;
    }

    Promise.all(promises)
      .then((results) => {
        const bars: Bar[] = [];
        results.forEach((data) => {
          if (data.t.length > 0) {
            data.t.forEach((time: number, index: number) => {
              bars.push({
                time: time * 1000,
                low: data.l[index],
                high: data.h[index],
                open: data.o[index],
                close: data.c[index],
              });
            });
          }
        });

        if (firstDataRequest && bars.length > 0) {
          lastBarsCache.set(symbolInfo.ticker, {
            ...bars[bars.length - 1],
          });
        }

        onHistoryCallback(bars, { noData: bars.length === 0 });
      })
      .catch((error) => {
        console.log("[getBars]: Get error", error);
        onErrorCallback(error);
      });
  },
  subscribeBars: (
    symbolInfo,
    resolution,
    onRealtimeCallback,
    subscriberUID,
    onResetCacheNeededCallback,
  ) => {
    console.log(
      "[subscribeBars]: Method call with subscriberUID:",
      subscriberUID,
    );

    const lastBar = lastBarsCache.get(symbolInfo.ticker);

    if (lastBar) {
      subscribeOnStream(
        symbolInfo,
        resolution,
        onRealtimeCallback,
        subscriberUID,
        onResetCacheNeededCallback,
        lastBar,
      );
    } else {
      console.error(
        `[subscribeBars]: No last bar found for ${symbolInfo.ticker}.`,
      );
      // Handle the case when lastBar is undefined, possibly by initializing a new Bar or skipping the subscription
    }
  },

  unsubscribeBars: (subscriberUID) => {
    console.log(
      "[unsubscribeBars]: Method call with subscriberUID:",
      subscriberUID,
    );
    unsubscribeFromStream(subscriberUID);
  },
};

export default datafeed;
