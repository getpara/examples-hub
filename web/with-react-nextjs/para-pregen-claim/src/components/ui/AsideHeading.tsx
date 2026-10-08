interface AsideHeadingProps {
  children: string;
}

export function AsideHeading({ children }: AsideHeadingProps) {
  return <h3 className="text-heading tracking-snug">{children}</h3>;
}
