import { Button } from "@/components/ui/Button";
import { cx } from "@/lib/classNames";

export interface OAuthProviderOption<Id extends string> {
  id: Id;
  label: string;
  markSrc: string;
  testId?: string;
}

interface OAuthProviderListProps<Id extends string> {
  providers: ReadonlyArray<OAuthProviderOption<Id>>;
  onSelect: (id: Id) => void;
  activeId?: string | null;
  disabled?: boolean;
  layout?: "list" | "grid";
  labelPrefix?: string;
}

export function OAuthProviderList<Id extends string>({
  providers,
  onSelect,
  activeId = null,
  disabled = false,
  layout = "list",
  labelPrefix = "Continue with",
}: OAuthProviderListProps<Id>) {
  return (
    <div className={cx("grid gap-2", layout === "grid" ? "grid-cols-2" : "grid-cols-1")}>
      {providers.map((provider) => {
        const isActive = activeId === provider.id;
        return (
          <Button
            key={provider.id}
            variant="outline"
            size="lg"
            fullWidth
            className="justify-start!"
            isLoading={isActive}
            disabled={!isActive && (disabled || activeId !== null)}
            onClick={() => onSelect(provider.id)}
            data-testid={provider.testId}
            icon={<img src={provider.markSrc} alt="" width={20} height={20} className="size-icon-md" />}>
            {`${labelPrefix} ${provider.label}`}
          </Button>
        );
      })}
    </div>
  );
}
