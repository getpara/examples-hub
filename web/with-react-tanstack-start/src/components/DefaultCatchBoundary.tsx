import { rootRouteId, useMatch, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { Button } from "@/components/ui/Button";
import { SignInPanel } from "@/components/ui/SignInPanel";
import { SEPOLIA } from "@/lib/chain";
import { formatErrorMessage } from "@/lib/format";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  });

  console.error("DefaultCatchBoundary Error:", error);

  return (
    <SignInPanel
      title="Something went wrong"
      description={formatErrorMessage(error.message) ?? "The page failed to load."}
      network={SEPOLIA.networkLabel}>
      <Button variant="outline" size="lg" fullWidth onClick={() => router.invalidate()}>
        Try again
      </Button>
      {isRoot ? (
        <Button variant="outline" size="lg" fullWidth onClick={() => router.navigate({ to: "/" })}>
          Home
        </Button>
      ) : (
        <Button variant="outline" size="lg" fullWidth onClick={() => window.history.back()}>
          Go back
        </Button>
      )}
    </SignInPanel>
  );
}
