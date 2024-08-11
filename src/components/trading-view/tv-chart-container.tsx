import React, { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

let tvScriptLoadingPromise: Promise<void> | undefined;

interface TradingViewWidgetProps {
  resolution: string;
  symbol: string;
}

function getCurrentTimezoneName() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  resolution,
  symbol,
}) => {
  const onLoadScriptRef = useRef<(() => void) | null>(null);
  const widgetRef = useRef<any>(null);
  const { theme } = useTheme();

  useEffect(() => {
    console.log("Symbol being passed to TradingView:", symbol);

    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement("script");
        script.id = "tradingview-widget-loading-script";
        script.src = "https://s3.tradingview.com/tv.js";
        script.type = "text/javascript";
        script.onload = () => resolve();

        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(
      () => onLoadScriptRef.current && onLoadScriptRef.current()
    );

    return () => {
      onLoadScriptRef.current = null;
    };

    function createWidget() {
      if (document.getElementById("tradingview") && "TradingView" in window) {
        if (widgetRef.current) {
          widgetRef.current.remove();
          widgetRef.current = null;
        }

        const validSymbol = `${symbol}USD`;

        widgetRef.current = new (window as any).TradingView.widget({
          container_id: "tradingview",
          autosize: true,
          symbol: `PYTH:${validSymbol}`,
          interval: resolution,
          timezone: getCurrentTimezoneName(),
          style: "1",
          locale: "en",
          theme: theme === "dark" ? "dark" : "light",
          enable_publishing: false,
          allow_symbol_change: true,
        });
      }
    }
  }, [symbol, resolution, theme]);

  return (
    <div id="tradingview" className="w-full h-[500px]" />
  );
};

export default TradingViewWidget;
