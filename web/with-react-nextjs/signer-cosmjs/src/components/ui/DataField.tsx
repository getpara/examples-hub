interface DataFieldProps {
  label: string;
  value: string;
  mono?: boolean;
}

export function DataField({ label, value, mono }: DataFieldProps) {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <p className={`text-sm ${mono ? "font-mono" : ""} bg-white p-4 border border-gray-200 break-all`}>
        {value}
      </p>
    </div>
  );
}
