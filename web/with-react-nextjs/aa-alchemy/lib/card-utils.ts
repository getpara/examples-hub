import { cn } from "@/lib/utils";

export const cardClassName = (className?: string) => {
  return cn(
    "max-w-lg w-full overflow-hidden rounded-lg",
    className
  );
};

export const cardWithHeightClassName = (className?: string) => {
  return cn(
    cardClassName(),
    "max-h-[85vh] overflow-auto",
    className
  );
};