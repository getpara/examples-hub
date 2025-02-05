import React from "react";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = "Loading..." }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 animate-fade-in fill-both">
      <div className="w-full max-w-md mx-auto text-center space-y-6">
        <div className="relative inline-flex">
          <div className="absolute inset-0 bg-secondary/20 rounded-full blur-xl animate-pulse" />
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-secondary/30 border-t-secondary animate-spin" />

            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary/20 border-b-primary animate-spin-reverse" />

            <div className="absolute inset-0 m-auto w-3 h-3 bg-primary rounded-full animate-pulse" />
          </div>
        </div>

        <div className="space-y-2 animate-slide-in-from-bottom delay-1 fill-both">
          <p className="text-base font-medium text-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
};
