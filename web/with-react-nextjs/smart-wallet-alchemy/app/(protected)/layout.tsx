import { AuthGuard } from "@/components/AuthGuard";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthGuard>{children}</AuthGuard>
    </ErrorBoundary>
  );
}
