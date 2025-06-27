interface StatusAlertProps {
  show: boolean;
  type: "info" | "error" | "success";
  message: string;
}

export function StatusAlert({ show, type, message }: StatusAlertProps) {
  if (!show) return null;

  const bgColor = {
    info: "bg-gray-100 border-gray-300",
    error: "bg-gray-200 border-gray-400",
    success: "bg-gray-50 border-gray-200",
  }[type];

  const textColor = {
    info: "text-gray-700",
    error: "text-gray-900",
    success: "text-gray-800",
  }[type];

  return (
    <div className={`mb-4 p-4 rounded-none border ${bgColor}`}>
      <p className={`text-sm ${textColor}`}>{message}</p>
    </div>
  );
}