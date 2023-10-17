export function validateColorInput(color: string): boolean {
  return /^#([0-9a-f]{3}){1,2}$/i.test(color);
}
