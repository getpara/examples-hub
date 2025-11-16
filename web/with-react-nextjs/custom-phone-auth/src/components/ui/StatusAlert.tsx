"use client";

interface StatusAlertProps {
  show: boolean;
  type: "info" | "success" | "error";
  message: string;
}

export function StatusAlert({ show, type, message }: StatusAlertProps) {
  if (!show) return null;

  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
  };

  return (
    <div
      className={`p-4 border rounded-none ${styles[type]}`}
      role="alert">
      <p className="text-sm">{message}</p>
    </div>
  );
}