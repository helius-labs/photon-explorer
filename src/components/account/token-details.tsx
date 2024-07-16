export default function TokenDetails({
  tokenDetails,
  tokenPrice,
}: {
  tokenDetails: {
    tokenSymbol: string | null;
    tokenDecimals: number | null;
  };
  tokenPrice: number | null;
}) {
  return (
    <div className="flex flex-row items-center justify-end space-x-6 text-sm text-muted-foreground w-full md:mr-4">
      <div className="flex flex-col items-center">
        <span className="font-semibold">Symbol</span>
        <span>{tokenDetails.tokenSymbol}</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="font-semibold">Decimals</span>
        <span>{tokenDetails.tokenDecimals}</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="font-semibold">Price</span>
        <span>${tokenPrice !== null ? tokenPrice.toFixed(2) : "N/A"}</span>
      </div>
    </div>
  );
}
