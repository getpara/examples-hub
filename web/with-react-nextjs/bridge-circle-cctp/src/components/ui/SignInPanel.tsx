import { useId, type ReactNode } from "react";

interface SignInPanelProps {
  title?: string;
  description: string;
  network: string;
  footnote?: string;
  children: ReactNode;
}

export function SignInPanel({
  title = "Sign in",
  description,
  network,
  footnote = "Secured by Para",
  children,
}: SignInPanelProps) {
  const titleId = useId();

  return (
    <div className="grid justify-items-stretch px-gutter py-6 md:justify-items-center md:px-sheet-x md:py-16">
      <section
        aria-labelledby={titleId}
        className="grid w-full max-w-auth gap-6 border border-border bg-surface p-6 md:p-8">
        <header className="grid gap-2">
          <img src="/para-mark.svg" alt="" width={28} height={27} className="mb-4 h-[27px] w-7" />
          <h2 id={titleId} className="text-title tracking-snug">
            {title}
          </h2>
          <p className="text-caption text-muted">{description}</p>
        </header>
        <div className="grid gap-4">{children}</div>
        <footer className="flex items-center justify-between gap-4 border-t border-border pt-4 text-caption text-muted">
          <span className="font-mono text-mono-label uppercase">{network}</span>
          <span>{footnote}</span>
        </footer>
      </section>
    </div>
  );
}
