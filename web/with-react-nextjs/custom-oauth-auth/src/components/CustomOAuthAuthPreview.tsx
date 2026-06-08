import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { OAUTH_PROVIDERS } from "@/constants/auth";

export function CustomOAuthAuthPreview() {
  return (
    <main className="ssr-preview min-h-screen bg-background">
      <Header isConnected={false} />

      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(22rem,1fr)] lg:px-8 lg:py-16">
        <div className="animate-fade-in-up">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">Custom OAuth auth</p>
          <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
            Social login with your own Para UI
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            Start an OAuth flow with Para hooks, then sign an EVM message once the wallet is connected.
          </p>
        </div>

        <div className="animate-fade-in-up w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border/60 px-6 py-5">
            <h2 className="text-lg font-semibold text-card-foreground">Sign in with OAuth</h2>
            <p className="mt-1 text-sm text-muted-foreground">Use Para OAuth hooks with your own provider buttons.</p>
          </div>
          <div className="space-y-5 px-6 py-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {OAUTH_PROVIDERS.map(({ method, label, icon }) => (
                <button
                  type="button"
                  key={method}
                  disabled
                  className="btn-secondary flex min-h-11 w-full items-center justify-center gap-3 px-4 text-sm">
                  <Image src={icon} alt="" width={20} height={20} className="h-5 w-5" />
                  <span className="font-medium">Continue with {label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
