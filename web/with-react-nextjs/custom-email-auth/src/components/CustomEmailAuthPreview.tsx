import { Header } from "@/components/layout/Header";

export function CustomEmailAuthPreview() {
  return (
    <main className="ssr-preview min-h-screen bg-background">
      <Header isConnected={false} />

      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(22rem,1fr)] lg:px-8 lg:py-16">
        <div className="animate-fade-in-up">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">Custom email auth</p>
          <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
            Email OTP with your own Para UI
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            Start an email auth flow with Para hooks, then sign an EVM message once the wallet is connected.
          </p>
        </div>

        <div className="animate-fade-in-up w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border/60 px-6 py-5">
            <h2 className="text-lg font-semibold text-card-foreground">Sign in with email</h2>
            <p className="mt-1 text-sm text-muted-foreground">Use Para email OTP with your own UI.</p>
          </div>
          <div className="space-y-5 px-6 py-5">
            <form className="space-y-4">
              <div>
                <label htmlFor="preview-email" className="mb-1.5 block text-sm font-medium text-card-foreground">
                  Email address
                </label>
                <input
                  id="preview-email"
                  type="email"
                  placeholder="you@example.com"
                  className="min-h-11 w-full rounded-lg border border-border bg-card px-3 text-sm text-card-foreground outline-none"
                  readOnly
                />
              </div>
              <button type="button" className="btn-primary min-h-11 w-full px-4 text-sm">
                Continue with Email
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
