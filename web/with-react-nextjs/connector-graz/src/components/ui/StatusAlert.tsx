interface StatusAlertProps {
  show: boolean;
  type: "info" | "error" | "success";
  message: string;
}

export function StatusAlert({ show, type, message }: StatusAlertProps) {
  if (!show) return null;

  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-900",
    error: "bg-red-50 border-red-200 text-red-900",
    success: "bg-green-50 border-green-200 text-green-900",
  };

  return (
    <div className={`mb-8 rounded-none border px-4 py-3 ${styles[type]}`}>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}