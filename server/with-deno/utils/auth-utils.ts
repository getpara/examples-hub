export function simulateVerifyToken(token: string): { email: string } | null {
  try {
    const [prefix, encodedEmail] = token.split(".");
    if (prefix !== "SIMULATED" || !encodedEmail) {
      return null;
    }
    const email = atob(encodedEmail);
    return { email };
  } catch (e) {
    console.error(e);
    return null;
  }
}
