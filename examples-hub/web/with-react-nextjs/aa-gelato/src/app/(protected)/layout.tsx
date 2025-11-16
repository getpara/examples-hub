import { AuthGuard } from "@/components/auth-guard";
import { ErrorBoundary } from "@/components/error-boundary";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthGuard>{children}</AuthGuard>
    </ErrorBoundary>
  );
}
