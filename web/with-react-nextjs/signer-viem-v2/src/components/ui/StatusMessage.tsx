interface StatusMessageProps {
  type: "success" | "error" | "info";
  message: string;
  show: boolean;
}

export function StatusMessage({ type, message, show }: StatusMessageProps) {
  if (!show) return null;

  const styles = {
    success: "bg-green-50 border-green-500 text-green-700",
    error: "bg-red-50 border-red-500 text-red-700",
    info: "bg-gray-50 border-gray-500 text-gray-700",
  };

  return (
    <div className={`mb-4 rounded-none border ${styles[type]}`}>
      <p className="px-6 py-4 break-words">{message}</p>
    </div>
  );
}
