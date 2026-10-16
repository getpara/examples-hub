import { Icon } from "@/components/ui/Icon";

interface ExampleFooterProps {
  docsHref: string;
  sourceHref: string;
  examplesHref?: string;
  note?: string;
}

const LINK_CLASS =
  "focus-ring inline-flex items-center gap-1 text-muted transition-colors duration-200 ease-brand hover:text-foreground hover:underline hover:underline-offset-[3px]";

export function ExampleFooter({
  docsHref,
  sourceHref,
  examplesHref = "https://examples.getpara.com",
  note = "Testnet only. No real funds move.",
}: ExampleFooterProps) {
  const resourceLinks = [
    { label: "Docs", href: docsHref },
    { label: "Source", href: sourceHref },
    { label: "getpara.com", href: "https://getpara.com" },
  ];

  return (
    <footer className="border-t border-border bg-background text-caption text-muted">
      <div className="mx-auto grid max-w-sheet gap-4 px-gutter py-6 md:flex md:min-h-header md:items-center md:gap-8 md:border-x md:border-border md:px-sheet-x md:py-0">
        <a href={examplesHref} className={`${LINK_CLASS} text-label`}>
          <Icon name="caret-left" className="size-icon-sm" />
          All examples
        </a>
        <p className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="size-1.5 flex-none bg-accent" />
          {note}
        </p>
        <nav aria-label="Resources" className="flex flex-wrap gap-x-6 gap-y-2 md:ml-auto">
          {resourceLinks.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className={LINK_CLASS}>
              {link.label}
              <Icon name="arrow-up-right" className="size-icon-sm" />
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
