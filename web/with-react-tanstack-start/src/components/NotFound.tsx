import { useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/Button";
import { SignInPanel } from "@/components/ui/SignInPanel";
import { SEPOLIA } from "@/lib/chain";

export function NotFound() {
  const router = useRouter();

  return (
    <SignInPanel
      title="Page not found"
      description="The page you are looking for does not exist."
      network={SEPOLIA.networkLabel}>
      <Button variant="outline" size="lg" fullWidth onClick={() => window.history.back()}>
        Go back
      </Button>
      <Button variant="outline" size="lg" fullWidth onClick={() => router.navigate({ to: "/" })}>
        Start over
      </Button>
    </SignInPanel>
  );
}
