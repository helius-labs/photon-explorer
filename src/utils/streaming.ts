// Assuming you're working in a browser environment that supports fetch and ReadableStream
const streamingUrl =
  "https://benchmarks.pyth.network/v1/shims/tradingview/streaming";
const channelToSubscription = new Map<string, SubscriptionItem>();

interface Bar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface SubscriptionItem {
  subscriberUID: string;
  resolution: string;
  lastDailyBar: Bar;
  handlers: Handler[];
}

interface Handler {
  id: string;
  callback: (bar: Bar) => void;
}

function handleStreamingData(data: { id: string; p: number; t: number }) {
  const { id, p: tradePrice, t } = data;

  const tradeTime = t * 1000; // Multiplying by 1000 to get milliseconds

  const channelString = id;
  const subscriptionItem = channelToSubscription.get(channelString);

  if (!subscriptionItem) {
    return;
  }

  const lastDailyBar = subscriptionItem.lastDailyBar;
  const nextDailyBarTime = getNextDailyBarTime(lastDailyBar.time);

  let bar: Bar;
  if (tradeTime >= nextDailyBarTime) {
    bar = {
      time: nextDailyBarTime,
      open: tradePrice,
      high: tradePrice,
      low: tradePrice,
      close: tradePrice,
    };
    console.log("[stream] Generate new bar", bar);
  } else {
    bar = {
      ...lastDailyBar,
      high: Math.max(lastDailyBar.high, tradePrice),
      low: Math.min(lastDailyBar.low, tradePrice),
      close: tradePrice,
    };
    console.log("[stream] Update the latest bar by price", tradePrice);
  }

  subscriptionItem.lastDailyBar = bar;

  // Send data to every subscriber of that symbol
  subscriptionItem.handlers.forEach((handler) => handler.callback(bar));
  channelToSubscription.set(channelString, subscriptionItem);
}

function startStreaming(retries = 3, delay = 3000) {
  fetch(streamingUrl)
    .then((response) => {
      const reader = response.body?.getReader();

      if (!reader) {
        console.error("[stream] No readable stream found.");
        return;
      }

      function streamData() {
        reader
          ?.read()
          .then(({ value, done }) => {
            if (done) {
              console.error("[stream] Streaming ended.");
              return;
            }

            if (value) {
              // Assuming the streaming data is separated by line breaks
              const dataStrings = new TextDecoder().decode(value).split("\n");
              dataStrings.forEach((dataString) => {
                const trimmedDataString = dataString.trim();
                if (trimmedDataString) {
                  try {
                    const jsonData = JSON.parse(trimmedDataString);
                    handleStreamingData(jsonData);
                  } catch (e) {
                    console.error("Error parsing JSON:", (e as Error).message);
                  }
                }
              });
            }

            streamData(); // Continue processing the stream
          })
          .catch((error) => {
            console.error("[stream] Error reading from stream:", error);
            attemptReconnect(retries, delay);
          });
      }

      streamData();
    })
    .catch((error) => {
      console.error(
        "[stream] Error fetching from the streaming endpoint:",
        error,
      );
    });

  function attemptReconnect(retriesLeft: number, delay: number) {
    if (retriesLeft > 0) {
      console.log(`[stream] Attempting to reconnect in ${delay}ms...`);
      setTimeout(() => {
        startStreaming(retriesLeft - 1, delay);
      }, delay);
    } else {
      console.error("[stream] Maximum reconnection attempts reached.");
    }
  }
}

function getNextDailyBarTime(barTime: number): number {
  const date = new Date(barTime * 1000);
  date.setDate(date.getDate() + 1);
  return date.getTime() / 1000;
}

export function subscribeOnStream(
  symbolInfo: { ticker: string },
  resolution: string,
  onRealtimeCallback: (bar: Bar) => void,
  subscriberUID: string,
  onResetCacheNeededCallback: () => void,
  lastDailyBar: Bar,
) {
  const channelString = symbolInfo.ticker;
  const handler: Handler = {
    id: subscriberUID,
    callback: onRealtimeCallback,
  };
  let subscriptionItem = channelToSubscription.get(channelString);

  if (!subscriptionItem) {
    subscriptionItem = {
      subscriberUID,
      resolution,
      lastDailyBar,
      handlers: [handler],
    };
  } else {
    subscriptionItem.handlers.push(handler);
  }

  channelToSubscription.set(channelString, subscriptionItem);
  console.log(
    "[subscribeBars]: Subscribe to streaming. Channel:",
    channelString,
  );

  // Start streaming when the first subscription is made
  startStreaming();
}

export function unsubscribeFromStream(subscriberUID: string) {
  // Find a subscription with id === subscriberUID
  for (const [channelString, subscriptionItem] of channelToSubscription) {
    const handlerIndex = subscriptionItem.handlers.findIndex(
      (handler) => handler.id === subscriberUID,
    );

    if (handlerIndex !== -1) {
      subscriptionItem.handlers.splice(handlerIndex, 1);
      if (subscriptionItem.handlers.length === 0) {
        console.log(
          "[unsubscribeBars]: Unsubscribe from streaming. Channel:",
          channelString,
        );
        channelToSubscription.delete(channelString);
      } else {
        channelToSubscription.set(channelString, subscriptionItem);
      }
      break;
    }
  }
}
