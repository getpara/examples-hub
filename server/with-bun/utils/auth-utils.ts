/**
 * Simulates token verification by extracting the prefix and email from the token.
 *
 * @param {string} token - The token to verify, expected in the format "SIMULATED.<email>".
 * @returns {{ email: string } | null} - The extracted email if the token is valid, otherwise null.
 */
export function simulateVerifyToken(token: string): { email: string } | null {
  if (!token) {
    return null;
  }

  try {
    const match = token.match(/^([^.]+)\.(.+)$/);

    if (!match) {
      return null;
    }

    const [, prefix, email] = match;

    if (prefix !== "SIMULATED" || !email) {
      return null;
    }

    return { email };
  } catch (error) {
    console.error("Failed to verify token:", error);
    return null;
  }
}
