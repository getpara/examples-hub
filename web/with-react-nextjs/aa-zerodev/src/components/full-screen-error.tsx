import { AlertCircle } from "lucide-react";

interface FullScreenErrorProps {
  title?: string;
  message?: string;
}

export function FullScreenError({ 
  title = "Something went wrong", 
  message = "An error occurred while loading. Please try again." 
}: FullScreenErrorProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
      <AlertCircle className="h-8 w-8 text-destructive mb-4" />
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground text-center max-w-md">{message}</p>
    </div>
  );
}