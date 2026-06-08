interface StatusAlertProps {
  type: "success" | "error" | "info";
  message: string;
}

const alertStyles = {
  success: "bg-success/8 border-success/15 text-success-foreground",
  error: "bg-destructive/8 border-destructive/15 text-destructive",
  info: "bg-muted/70 border-border text-muted-foreground",
};

export function StatusAlert({ type, message }: StatusAlertProps) {
  return (
    <div className={`mb-4 rounded-xl border px-4 py-3 animate-fade-in ${alertStyles[type]}`}>
      <p className="break-words text-sm">{message}</p>
    </div>
  );
}
