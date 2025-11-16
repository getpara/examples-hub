interface StatusAlertProps {
  message: string;
  type?: "success" | "error" | "info";
  className?: string;
}

export function StatusAlert({ message, type = "info", className = "" }: StatusAlertProps) {
  const baseClasses = "p-4 rounded-md border";
  
  const typeClasses = {
    success: "bg-gray-50 border-gray-300 text-gray-900",
    error: "bg-red-50 border-red-300 text-red-900",
    info: "bg-gray-50 border-gray-300 text-gray-700"
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${className}`}>
      {message}
    </div>
  );
}