"use client";

export default function BackgroundPattern() {
  const backgroundImageValue = `
    repeating-linear-gradient(to right, hsl(var(--border) / 0.2), hsl(var(--border) / 0.2) 1px, transparent 1px, transparent 32px),
    repeating-linear-gradient(to bottom, hsl(var(--border) / 0.2), hsl(var(--border) / 0.2) 1px, transparent 1px, transparent 32px),
    linear-gradient(to bottom right, hsl(var(--background)) 0%, hsl(var(--muted) / 0.15) 100%)
  `;
  const backgroundSizeValue = "32px 32px, 32px 32px, auto";

  return (
    <div
      className="absolute inset-0 -z-10 overflow-hidden"
      style={{
        backgroundImage: backgroundImageValue,
        backgroundSize: backgroundSizeValue,
      }}
    />
  );
}
