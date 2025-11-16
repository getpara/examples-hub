interface Asset {
  id: string;
  name: string;
  symbol: string;
  icon: string;
}

interface AssetDisplayProps {
  asset: Asset;
}

export function AssetDisplay({ asset }: AssetDisplayProps) {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-6 py-3">
        <img
          src={asset.icon}
          alt={asset.name}
          className={`w-10 h-10 rounded-full object-cover `}
        />
        <div>
          <div className="font-bold text-xl text-gray-900">{asset.symbol}</div>
          <div className="text-sm text-gray-600">{asset.name}</div>
        </div>
      </div>
    </div>
  );
}
