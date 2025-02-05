import { AlertCircle } from "lucide-react";
import { Button } from "./button";

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 animate-fade-in fill-both">
      <div className="w-full max-w-md mx-auto text-center space-y-6">
        {/* Error Icon */}
        <div className="relative inline-flex">
          <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl animate-pulse" />
          <div className="relative bg-background border border-border rounded-full p-4">
            <AlertCircle className="w-12 h-12 text-destructive animate-fade-in" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-2 animate-slide-in-from-bottom delay-1 fill-both">
          <h1 className="text-2xl font-semibold text-foreground">Something went wrong</h1>
          <p className="text-muted-foreground text-base max-w-sm mx-auto break-words">{error}</p>
        </div>

        {/* Retry Button */}
        {onRetry && (
          <Button
            onClick={onRetry}
            className="animate-slide-in-from-bottom delay-2 fill-both bg-secondary hover:bg-secondary/90 transition-colors duration-200">
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
};
