import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

interface ExternalLinkProps {
  href: string;
  children: ReactNode;
  testId?: string;
}

export function ExternalLink({ href, children, testId }: ExternalLinkProps) {
  return (
    <a
      href={href}
      data-testid={testId}
      target="_blank"
      rel="noreferrer"
      className="focus-ring inline-flex w-fit items-center gap-1 text-label text-foreground underline decoration-border-strong underline-offset-4">
      {children}
      <Icon name="arrow-up-right" className="size-icon-sm" />
    </a>
  );
}
