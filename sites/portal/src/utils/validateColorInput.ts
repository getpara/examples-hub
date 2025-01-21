export function validateColorInput(color: string): boolean {
  const s = new Option().style;
  s.color = color;
  return s.color !== '';
}
