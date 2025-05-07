export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }) {
  if (!initial && path.includes("para?method=login")) {
    return "/auth";
  }
}
