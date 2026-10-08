import Link from "next/link";
import { cx } from "@/lib/classNames";

export interface DemoNavItem {
  href: string;
  label: string;
  api?: string;
}

interface DemoNavProps {
  items: readonly DemoNavItem[];
  currentHref: string;
  title?: string;
}

function revealInScrollingList(link: HTMLAnchorElement | null) {
  const list = link?.closest("ol");
  if (!link || !list) return;

  const linkBounds = link.getBoundingClientRect();
  const listBounds = list.getBoundingClientRect();
  list.scrollLeft += linkBounds.left - listBounds.left - (listBounds.width - linkBounds.width) / 2;
}

export function DemoNav({ items, currentHref, title = "Demos" }: DemoNavProps) {
  return (
    <nav aria-label={title} className="grid content-start gap-4 pt-4 lg:py-8">
      <p className="px-gutter font-mono text-mono-label text-muted uppercase md:px-sheet-x">{title}</p>
      <ol className="flex overflow-x-auto border-y border-border lg:grid lg:overflow-visible lg:border-b-0">
        {items.map((item, index) => {
          const isCurrent = item.href === currentHref;

          return (
            <li key={item.href} className="flex-none border-r border-border lg:border-r-0 lg:border-b">
              <Link
                href={item.href}
                ref={isCurrent ? revealInScrollingList : undefined}
                aria-current={isCurrent ? "page" : undefined}
                className={cx(
                  "flex items-center gap-2 border-b-2 px-4 py-3 whitespace-nowrap text-foreground transition-colors duration-200 ease-brand focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring lg:grid lg:grid-cols-[28px_minmax(0,1fr)] lg:items-start lg:gap-x-0 lg:gap-y-1 lg:border-b-0 lg:border-l-2 lg:px-sheet-x lg:whitespace-normal",
                  isCurrent ? "border-accent bg-surface" : "border-transparent hover:bg-surface-2"
                )}>
                <span
                  className={cx(
                    "font-mono text-mono-label leading-5 lg:row-span-2",
                    isCurrent ? "text-accent" : "text-muted"
                  )}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-label leading-5">{item.label}</span>
                {item.api && (
                  <code className="hidden truncate font-mono text-mono-label text-muted lg:block">{item.api}</code>
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
