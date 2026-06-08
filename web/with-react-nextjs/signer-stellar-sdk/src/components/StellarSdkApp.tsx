import { ParaProvider } from "@/components/ParaProvider";
import { ConnectedHeader } from "@/components/layout/ConnectedHeader";

export function StellarSdkApp({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <ParaProvider>
        <ConnectedHeader />
        <main>{children}</main>
      </ParaProvider>
    </div>
  );
}
