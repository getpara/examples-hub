interface DataFieldProps {
  label: string;
  value: string;
  isLoading?: boolean;
  loadingText?: string;
  onRefresh?: () => void;
  refreshDisabled?: boolean;
  subLabel?: string;
}

export function DataField({
  label,
  value,
  isLoading,
  loadingText = "Loading...",
  onRefresh,
  refreshDisabled,
  subLabel,
}: DataFieldProps) {
  return (
    <div className="mb-8 rounded-none border border-gray-200">
      <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">{label}</h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshDisabled || isLoading}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
            title="Refresh">
            <span className={`inline-block ${isLoading ? "animate-spin" : ""}`}>&#x21bb;</span>
          </button>
        )}
      </div>
      <div className="px-6 py-3">
        {subLabel && <p className="text-sm text-gray-500 bg-gray-100 p-2 rounded-none mb-2">{subLabel}</p>}
        <p className="text-lg font-medium text-gray-900">{isLoading ? loadingText : value}</p>
      </div>
    </div>
  );
}
