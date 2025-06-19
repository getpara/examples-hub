interface Asset {
  symbol: string;
}

interface ReceiveAmountProps {
  destAmount: string;
  asset: Asset;
  rate?: string;
  impactPercent?: string;
}

export function ReceiveAmount({ destAmount, asset, rate, impactPercent }: ReceiveAmountProps) {
  return (
    <div className="bg-blue-50 rounded-2xl p-4 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-blue-700 font-medium">You will receive</span>
        <span className="text-sm text-blue-600 font-medium">
          ~{destAmount} {asset.symbol}
        </span>
      </div>
      {rate && <div className="text-xs text-blue-600">Exchange rate: 1 USDC = {rate} USDC</div>}
      {impactPercent && <div className="text-xs text-blue-600">Total impact: {impactPercent}%</div>}
    </div>
  );
}
