import { Badge } from "@/components/ui/Badge";

interface BadgeListProps {
  label: string;
  items: string[];
  hint?: string;
}

export function BadgeList({ label, items, hint }: BadgeListProps) {
  return (
    <div className="grid gap-5">
      <ul aria-label={label} className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item}>
            <Badge>{item}</Badge>
          </li>
        ))}
      </ul>
      {hint && <p className="text-caption text-muted">{hint}</p>}
    </div>
  );
}
