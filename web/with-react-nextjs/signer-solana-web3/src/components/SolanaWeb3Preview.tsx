import Image from "next/image";
import Link from "next/link";

type PreviewVariant = "selector" | "message-signing" | "sol-transfer";

const demoCards = [
  {
    title: "Message Signing",
    description:
      "Sign a message with Para's Solana web3.js signer and verify the signature against the wallet key.",
    path: "/message-signing",
  },
  {
    title: "SOL Transfer",
    description:
      "Build, sign, submit, and confirm a Solana Devnet transfer with Para's web3.js signer.",
    path: "/sol-transfer",
  },
];

const routeContent = {
  "message-signing": {
    title: "Message Signing Demo",
    description:
      "Sign arbitrary text with Para's Solana web3.js signer, then verify the signature with the connected public key.",
    fields: [{ label: "Message to Sign", placeholder: "Hello from Para + web3.js!", as: "textarea" as const }],
    button: "Connect Wallet",
  },
  "sol-transfer": {
    title: "SOL Transfer Demo",
    description: "Send SOL on Devnet with a transaction signed by Para's Solana web3.js integration.",
    fields: [
      { label: "Recipient Address", placeholder: "Solana recipient address", as: "input" as const },
      { label: "Amount (SOL)", placeholder: "0.0", as: "input" as const },
    ],
    button: "Connect Wallet",
  },
};

function PreviewHeader({ showBackLink }: { showBackLink: boolean }) {
  return (
    <header className="sticky top-0 z-10 border-b border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/para.svg" alt="Para" width={28} height={28} priority className="h-5 w-auto" />
            <span className="text-xs font-medium text-muted-foreground">Solana web3.js</span>
          </Link>

          {showBackLink && (
            <Link
              href="/"
              className="hidden rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground sm:inline-flex">
              Back to demos
            </Link>
          )}
        </div>

        <div className="btn-primary px-5 py-1.5 text-sm">Connect Wallet</div>
      </div>
    </header>
  );
}

export function SolanaWeb3Preview({ variant }: { variant: PreviewVariant }) {
  return (
    <main className="ssr-preview min-h-screen">
      <PreviewHeader showBackLink={variant !== "selector"} />
      {variant === "selector" ? <SelectorPreview /> : <DemoPreview variant={variant} />}
    </main>
  );
}

function SelectorPreview() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mx-auto mb-10 max-w-3xl text-center animate-fade-in-up">
        <h1 className="mb-3 text-3xl font-semibold tracking-tight text-card-foreground">
          Para Solana web3.js
        </h1>
        <p className="text-[13px] font-mono leading-relaxed text-muted-foreground">
          Explore Solana message signing and SOL transfers with Para's web3.js signer.
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
        {demoCards.map((card) => (
          <div
            key={card.path}
            className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm animate-fade-in-up">
            <div className="flex-grow px-6 py-5">
              <h3 className="mb-2 text-base font-semibold tracking-tight text-card-foreground">{card.title}</h3>
              <p className="text-[13px] font-mono leading-relaxed text-muted-foreground">{card.description}</p>
            </div>
            <div className="border-t border-border/60 px-6 py-4">
              <Link href={card.path} className="btn-primary inline-flex w-full items-center justify-center px-4 py-2.5 text-sm">
                View Demo
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DemoPreview({ variant }: { variant: Exclude<PreviewVariant, "selector"> }) {
  const content = routeContent[variant];

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mb-8 text-center animate-fade-in-up">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-card-foreground">{content.title}</h1>
        <p className="mx-auto max-w-2xl text-[13px] font-mono leading-relaxed text-muted-foreground">
          {content.description}
        </p>
      </div>

      <div className="mx-auto max-w-xl">
        <div className="mb-4 flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm animate-fade-in-up">
          <div className="flex-grow px-6 py-5">
            <h3 className="mb-2 text-base font-semibold tracking-tight text-card-foreground">Current Balance</h3>
            <p className="text-[13px] font-mono leading-relaxed text-muted-foreground">Network: Solana Devnet</p>
          </div>
          <div className="border-t border-border/60 px-6 py-4 text-lg font-medium text-card-foreground">
            Please connect your wallet
          </div>
        </div>

        <div className="space-y-4">
          {content.fields.map((field) => (
            <div key={field.label} className="space-y-3">
              <label className="block text-sm font-medium text-foreground">{field.label}</label>
              {field.as === "textarea" ? (
                <textarea className="field-control" rows={4} placeholder={field.placeholder} readOnly />
              ) : (
                <input className="field-control" placeholder={field.placeholder} readOnly />
              )}
            </div>
          ))}

          <button type="button" className="btn-primary w-full px-6 py-3 text-sm">
            {content.button}
          </button>
        </div>
      </div>
    </div>
  );
}
