// Do to Expo Router we need to interecept the scheme://path?query and redirect to the correct path
// This is a workaround to redirect the user to the correct path when using the native intent
export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }) {
  console.log("redirectSystemPath called with path:", path, "and initial:", initial);
  try {
    if (path.includes("para?method=login") && !initial) {
      return `/auth/with-oauth`;
    }
    return path;
  } catch (error) {
    return "/unexpected-error";
  }
}
