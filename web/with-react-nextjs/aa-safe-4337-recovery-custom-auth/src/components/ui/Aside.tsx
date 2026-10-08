import { useId, type ReactNode } from "react";

interface AsideProps {
  title: string;
  status?: ReactNode;
  children: ReactNode;
}

export function Aside({ title, status, children }: AsideProps) {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className="grid content-start gap-5 px-gutter py-8 md:px-sheet-x">
      <header className="flex min-h-7 items-center gap-3">
        <h2 id={titleId} className="mr-auto font-mono text-mono-label text-muted uppercase">
          {title}
        </h2>
        {status}
      </header>
      {children}
    </section>
  );
}
