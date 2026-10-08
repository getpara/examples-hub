import { StatusHint } from "@/components/ui/StatusHint";

interface LoadingPanelProps {
  message: string;
  label?: string;
}

export function LoadingPanel({ message, label = "Loading" }: LoadingPanelProps) {
  return (
    <div className="grid justify-items-stretch px-gutter py-6 md:justify-items-center md:px-sheet-x md:py-16">
      <section aria-busy="true" aria-label={label} className="grid w-full max-w-auth border border-border bg-surface p-6 md:p-8">
        <StatusHint>{message}</StatusHint>
      </section>
    </div>
  );
}
