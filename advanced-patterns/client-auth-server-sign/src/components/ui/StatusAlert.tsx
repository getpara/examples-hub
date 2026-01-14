interface StatusAlertProps {
  show: boolean;
  type: "success" | "error" | "info";
  message: string;
}

export function StatusAlert({ show, type, message }: StatusAlertProps) {
  if (!show) return null;

  const colorClasses = {
    success: "bg-gray-50 border-gray-500 text-gray-700",
    error: "bg-gray-50 border-gray-800 text-gray-900",
    info: "bg-gray-50 border-gray-400 text-gray-600",
  };

  return (
    <div className={`mb-4 rounded-none border ${colorClasses[type]}`}>
      <p className="px-6 py-4 break-words">{message}</p>
    </div>
  );
}
