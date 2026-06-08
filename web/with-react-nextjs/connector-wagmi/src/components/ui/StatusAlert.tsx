interface StatusAlertProps {
  show: boolean;
  type: "info" | "error" | "success";
  message: string;
}

const STATUS_STYLES = {
  info: "border-border bg-muted/60 text-muted-foreground",
  error: "border-destructive/15 bg-destructive/8 text-destructive",
  success: "border-success/15 bg-success/8 text-success-foreground",
};

export function StatusAlert({ show, type, message }: StatusAlertProps) {
  if (!show) return null;

  return (
    <div className={`animate-fade-in rounded-xl border px-4 py-3 ${STATUS_STYLES[type]}`}>
      <p className="text-sm">{message}</p>
    </div>
  );
}
