import React, { useEffect, useRef } from 'react';
import { widget, ChartingLibraryWidgetOptions, ResolutionString } from '@/../public/charting_library';
import styles from './index.module.css';
import { useTheme } from 'next-themes';

interface TradingViewWidgetProps {
  address: string;
  resolution: string;
  symbol: string;
}

declare global {
  interface Window {
    tvScriptLoadingPromise?: Promise<void>;
    Datafeeds?: any;
  }
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  resolution,
  symbol,
}) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const widgetRef = useRef<any>(null);
  const { theme } = useTheme();


  useEffect(() => {
    if (!window.tvScriptLoadingPromise) {
      window.tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement('script');
        script.id = 'tradingview-widget-loading-script';
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.onload = () => resolve();

        document.head.appendChild(script);
      });
    }

    window.tvScriptLoadingPromise.then(() => {
      if (window.Datafeeds && chartContainerRef.current) {
        const validSymbol = `${symbol}USD`;
        const widgetOptions: ChartingLibraryWidgetOptions = {
          symbol: validSymbol,
          datafeed: new window.Datafeeds.UDFCompatibleDatafeed(
            "https://benchmarks.pyth.network/v1/shims/tradingview",
            undefined,
            {
              maxResponseLength: 1000,
              expectedOrder: "latestFirst",
            }
          ),
          interval: resolution as ResolutionString,
          container: chartContainerRef.current,
          library_path: '/charting_library/',
          locale: 'en',
          disabled_features: [
            'hide_left_toolbar_by_default',
            'use_localstorage_for_settings',
            'header_chart_type',
            'header_compare',
            'header_saveload',
            'header_symbol_search',
            'header_quick_search',
            'header_undo_redo',
            'header_settings',
            'header_indicators',
            'timeframes_toolbar',
            'control_bar',
            'left_toolbar',
            'volume_force_overlay',
            'create_volume_indicator_by_default',
          ],
          enabled_features: [
            'study_templates',
            'create_volume_indicator_by_default_once',
          ],
          fullscreen: false,
          autosize: true,
          loading_screen: {
            foregroundColor: "#e64b34",
          },
          theme: theme === 'dark' ? 'dark' : 'light',
          overrides: {
            // Background and grid settings
            "paneProperties.background": theme === 'dark' ? "#000000" : "#FFFFFF",
            "paneProperties.backgroundType": "solid",
            "scalesProperties.backgroundColor": theme === 'dark' ? "#000000" : "#FFFFFF",
            "paneProperties.vertGridProperties.color": 'rgba(0,0,0,0)',
            "paneProperties.horzGridProperties.color": 'rgba(0,0,0,0)',
        
            // Candle settings
            "mainSeriesProperties.candleStyle.upColor": theme === 'dark' ? "#06D6A0" : "#32CD32",
            "mainSeriesProperties.candleStyle.downColor": theme === 'dark' ? "#EF476F" : "#FF6347",
            "mainSeriesProperties.candleStyle.drawWick": true,
            "mainSeriesProperties.candleStyle.drawBorder": true,
            "mainSeriesProperties.candleStyle.borderColor": theme === 'dark' ? "#06D6A0" : "#32CD32",
            "mainSeriesProperties.candleStyle.borderUpColor": theme === 'dark' ? "#06D6A0" : "#32CD32",
            "mainSeriesProperties.candleStyle.borderDownColor": theme === 'dark' ? "#EF476F" : "#FF6347",
            "mainSeriesProperties.candleStyle.wickUpColor": theme === 'dark' ? "#06D6A0" : "#32CD32",
            "mainSeriesProperties.candleStyle.wickDownColor": theme === 'dark' ? "#EF476F" : "#FF6347",
        
            // Legend and study visibility settings
            "paneProperties.legendProperties.showStudyTitles": false,
            "scalesProperties.showStudyLastValue": false,
            "paneProperties.legendProperties.showBackground": false,
            "paneProperties.legendProperties.backgroundTransparency": true,
        
            // Text and scales settings
            "scalesProperties.textColor": theme === 'dark' ? "#ffffff" : "#000000",
          },
          studies_overrides: {},
          custom_css_url: '/styles/tradingview.css',
          custom_formatters: {
            priceFormatterFactory: createPriceFormatter(),
            timeFormatter: createTimeFormatter(),
            dateFormatter: createDateFormatter(),
          },
        };

        widgetRef.current = new widget(widgetOptions);

        widgetRef.current.onChartReady(() => {
          widgetRef.current.setCSSCustomProperty('--tv-color-pane-background', theme === 'dark' ? '#000000' : '#FFFFFF');
          widgetRef.current.headerReady().then(() => {
            const button = widgetRef.current.createButton();
            button.classList.add("apply-common-tooltip");
            button.innerHTML = "TradingView Charts";
            button.addEventListener('click', () => {
              window.open('https://www.tradingview.com', '_blank');
            });
          });

        });
      }
    });

    return () => {
      if (widgetRef.current) {
        widgetRef.current.remove();
        widgetRef.current = null;
      }
    };
  }, [symbol, resolution, theme]);  // Re-render widget when theme changes

  return (
    <div ref={chartContainerRef} className={styles.TVChartContainer} />
  );
};

function createPriceFormatter() {
  return (symbolInfo: any, minTick: string) => {
    return {
      format: (price: number) => {
        let suffix = '';
        let dividedPrice = price;

        if (price >= 1_000_000_000) {
          suffix = 'B';
          dividedPrice = price / 1_000_000_000;
        } else if (price >= 1_000_000) {
          suffix = 'M';
          dividedPrice = price / 1_000_000;
        } else if (price >= 1_000) {
          suffix = 'K';
          dividedPrice = price / 1_000;
        }

        const priceString = dividedPrice.toString();
        const [integerPart, rawDecimalPart] = priceString.split(".");
        const decimalPlaces = rawDecimalPart && /^0+[1-9]/.test(rawDecimalPart) ? 6 : 4;
        const formattedPrice = dividedPrice.toFixed(decimalPlaces);
        const [_, decimalPart] = formattedPrice.split(".");

        if (!decimalPart) {
          return `${integerPart}${suffix}`;
        }

        const firstNonZeroIndex = decimalPart.search(/[^0]/);
        if (firstNonZeroIndex === -1) {
          return `${integerPart}${suffix}`;
        }

        const leadingZerosCount = firstNonZeroIndex;
        const significantDigits = decimalPart.substring(firstNonZeroIndex);

        return `${integerPart}.` +
          `${'0'.repeat(leadingZerosCount)}` +
          `${significantDigits}${suffix}`;
      }
    };
  };
}

function createTimeFormatter() {
  return {
    format: (date: Date) => `${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}:${date.getUTCSeconds().toString().padStart(2, '0')}`,
    formatLocal: (date: Date) => `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`,
    parse: (dateString: string) => dateString,
  };
}

function createDateFormatter() {
  return {
    format: (date: Date) => `${date.getUTCFullYear()}/${(date.getUTCMonth() + 1).toString().padStart(2, '0')}/${date.getUTCDate().toString().padStart(2, '0')}`,
    formatLocal: (date: Date) => `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`,
    parse: (dateString: string) => dateString,
  };
}

function formatPriceWithSupSub(price: number | null) {
  if (price == null) return '';

  const priceString = price.toString();
  const [integerPart, rawDecimalPart] = priceString.split(".");
  const hasLeadingZeros = rawDecimalPart && /^0+[1-9]/.test(rawDecimalPart);
  const decimalPlaces = hasLeadingZeros ? 6 : 2;
  const formattedPrice = price.toFixed(decimalPlaces);
  const [_, decimalPart] = formattedPrice.split(".");

  if (!decimalPart) {
    return integerPart;
  }

  const firstNonZeroIndex = decimalPart.search(/[^0]/);
  if (firstNonZeroIndex === -1) {
    return integerPart;
  }

  const leadingZerosCount = firstNonZeroIndex;
  const significantDigits = decimalPart.substring(firstNonZeroIndex);

  return (
    `${integerPart}.` +
    (leadingZerosCount > 0 ? `<sub>${'0'.repeat(leadingZerosCount)}</sub>` : '') +
    `${significantDigits}`
  );
}

export default TradingViewWidget;
