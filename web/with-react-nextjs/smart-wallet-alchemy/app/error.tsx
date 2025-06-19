"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="container mx-auto py-8 px-4 flex-1 flex flex-col items-center justify-center min-h-screen">
      <Card className="w-full max-w-lg max-h-[85vh] overflow-auto text-center">
        <CardHeader className="pt-8">
          <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
          <CardTitle className="text-2xl">Something went wrong!</CardTitle>
          <CardDescription className="text-destructive">
            An unexpected error occurred while processing your request.
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6">
          <pre className="whitespace-pre-wrap break-words max-h-60 overflow-auto text-sm text-muted-foreground bg-muted/50 p-4 rounded-md">
            {error.message || "Unknown error"}
          </pre>
          {error.digest && <p className="text-xs text-muted-foreground mt-4">Error ID: {error.digest}</p>}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="w-full sm:w-auto"
            data-testid="error-go-home-button">
            Go Home
          </Button>
          <Button
            onClick={reset}
            className="w-full sm:w-auto"
            data-testid="error-try-again-button">
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
