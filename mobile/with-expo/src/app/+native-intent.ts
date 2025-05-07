export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }) {
  try {
    if (path.includes("para?method=login") && !initial) {
      return `/auth`;
    }
    return path;
  } catch (error) {
    return "/unexpected-error";
  }
}
