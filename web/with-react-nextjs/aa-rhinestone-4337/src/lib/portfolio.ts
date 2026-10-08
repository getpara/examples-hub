export function formatTokenCount(count: number | null) {
  if (count === null) {
    return "Not loaded";
  }

  return `${count} ${count === 1 ? "token" : "tokens"}`;
}
