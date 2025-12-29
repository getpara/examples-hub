interface DataFieldProps {
  label: string;
  value: string | null | undefined;
  isLoading?: boolean;
  mono?: boolean;
}

export function DataField({ label, value, isLoading = false, mono = false }: DataFieldProps) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm font-medium text-gray-900 ${mono ? "font-mono" : ""}`}>
        {isLoading ? "Loading..." : value ?? "-"}
      </span>
    </div>
  );
}
