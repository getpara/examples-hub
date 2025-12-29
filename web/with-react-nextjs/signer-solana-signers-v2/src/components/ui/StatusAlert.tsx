interface StatusAlertProps {
  type: "success" | "error" | "info";
  message: string;
}

export function StatusAlert({ type, message }: StatusAlertProps) {
  const styles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  return (
    <div className={`p-4 border ${styles[type]} mb-4`}>
      <p className="text-sm">{message}</p>
    </div>
  );
}
