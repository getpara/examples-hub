import Image from "next/image";

interface ConnectWalletCardProps {
  onConnect: () => void;
}

export function ConnectWalletCard({ onConnect }: ConnectWalletCardProps) {
  return (
    <div className="w-full max-w-sm animate-fade-in-up">
      <div className="rounded-2xl border border-border bg-card p-10 shadow-xl shadow-black/[0.04] text-center">
        <Image
          src="/para.svg"
          alt="Para"
          width={84}
          height={28}
          className="h-7 w-auto mx-auto mb-8 opacity-80"
        />

        <h1 className="text-xl font-semibold tracking-tight text-card-foreground mb-3">
          Connect a Cosmos wallet
        </h1>
        <p className="text-[13px] font-mono text-muted-foreground leading-relaxed mb-8">
          Use Para through Graz to connect to Cosmos ICS Provider Testnet and send tokens.
        </p>

        <button
          type="button"
          onClick={onConnect}
          data-testid="auth-connect-button"
          className="btn-primary w-full px-4 py-2.5">
          Connect with Para
        </button>
      </div>
    </div>
  );
}
