import { AppShell } from "@/components/layout/AppShell";
import { ExampleFooter } from "@/components/layout/ExampleFooter";
import { ExampleHeader } from "@/components/layout/ExampleHeader";
import { Workbench } from "@/components/layout/Workbench";
import { AccountStripSkeleton } from "@/components/ui/AccountStripSkeleton";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Button } from "@/components/ui/Button";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { SEPOLIA } from "@/lib/chain";
import { EXAMPLE } from "@/lib/example";

export function ParaModalFallback() {
  return (
    <AppShell
      header={<ExampleHeader scope={EXAMPLE.scope} isConnected={false} isConnecting />}
      footer={<ExampleFooter docsHref={EXAMPLE.docsHref} sourceHref={EXAMPLE.sourceHref} />}>
      <AccountStripSkeleton network={SEPOLIA.name} />
      <Workbench aside={<ResultPanel status="empty" emptyMessage="The signature appears here after you sign." />}>
        <ActionPanel
          title="Sign a message"
          api="useSignMessage().signMessage({ walletId, messageBase64 })"
          description="Signing proves you control this account. It does not send a transaction or cost gas."
          actions={
            <Button size="lg" disabled data-testid="sign-submit-button">
              Sign Hello World!
            </Button>
          }>
          <TextAreaField label="Message" value="Hello World!" readOnly hint="The app signs this exact text." />
        </ActionPanel>
      </Workbench>
    </AppShell>
  );
}
