import chroma from 'chroma-js';

// Lighten/darken in OKLCH space (perceptually accurate)
export function lighten(hexColor: string, amount: number) {
  const [l, c, h] = chroma(hexColor).oklch();
  return chroma.oklch(Math.min(l + amount, 1), c, h).hex();
}

export function darken(hexColor: string, amount: number) {
  const [l, c, h] = chroma(hexColor).oklch();
  return chroma.oklch(Math.max(l - amount, 0), c, h).hex();
}

// Adjust saturation (chroma)
export function saturate(hexColor: string, amount: number) {
  const [l, c, h] = chroma(hexColor).oklch();
  return chroma.oklch(l, c * (1 + amount), h).hex();
}

// Get complementary color
export function complement(hexColor: string) {
  const [l, c, h] = chroma(hexColor).oklch();
  return chroma.oklch(l, c, (h + 180) % 360).hex();
}
