import React from "react";

interface CardProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export function Card({ children, title, description }: CardProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm animate-fade-in-up">
      <div className="flex-grow px-6 py-5">
        <h3 className="mb-2 text-base font-semibold tracking-tight text-card-foreground">{title}</h3>
        <p className="text-[13px] font-mono leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="border-t border-border/60 px-6 py-4">{children}</div>
    </div>
  );
}
