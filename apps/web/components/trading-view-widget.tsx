"use client"

interface TradingViewWidgetProps {
  symbol: string;
  contractAddress: string;
}

export default function TradingViewWidget({ contractAddress }: TradingViewWidgetProps) {
  return (
    <div className="tradingview-widget-container h-full w-full">
      <iframe
        src={`https://dexscreener.com/solana/${contractAddress}?embed=1&theme=dark&minimal=1`}
        style={{ width: '100%', height: '100%' }}
        className="rounded-lg"
        allow="clipboard-write"
      />
    </div>
  );
} 