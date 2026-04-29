interface StatusBannerProps {
  message: string;
  tone: "success" | "error";
}

const toneClassName = {
  success: "border-success/20 bg-success/8 text-success-foreground",
  error: "border-destructive/20 bg-destructive/8 text-destructive",
};

export function StatusBanner({ message, tone }: StatusBannerProps) {
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm animate-fade-in ${toneClassName[tone]}`}>
      {message}
    </div>
  );
}
