import { cx } from "@/lib/classNames";

const DOTS: Array<[number, number]> = [
  [0, 0],
  [6, 0],
  [12, 0],
  [12, 6],
  [12, 12],
  [6, 12],
  [0, 12],
  [0, 6],
];

interface LoadingMarkProps {
  tone?: "accent" | "inverse";
  className?: string;
}

export function LoadingMark({ tone = "accent", className }: LoadingMarkProps) {
  return (
    <svg
      viewBox="0 0 14 14"
      aria-hidden="true"
      className={cx(
        "size-icon-md flex-none fill-current",
        tone === "accent" ? "text-accent" : "text-on-primary",
        className
      )}>
      {DOTS.map(([x, y], index) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width="2"
          height="2"
          className="opacity-20 motion-safe:animate-loading-step motion-reduce:opacity-100"
          style={{ animationDelay: `${index * 100}ms` }}
        />
      ))}
    </svg>
  );
}
