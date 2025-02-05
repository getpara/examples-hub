import { Capsule as CapsuleServer, Environment } from "@usecapsule/server-sdk";
import { simulateVerifyToken } from "../utils/auth-utils";

interface RequestBody {
  email: string;
  session: string;
}

/**
 * Handles signing with Capsule Session.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Promise<Response>} - The response indicating the session was processed.
 */
export const signWithCapsuleSession = async (req: Request): Promise<Response> => {
  // Validate Authorization header
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Use your own token verification logic here
  const token = authHeader.split(" ")[1];
  const user = simulateVerifyToken(token);

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Parse and validate request body
  const { email, session }: RequestBody = await req.json();
  if (user.email !== email) {
    return new Response("Forbidden", { status: 403 });
  }

  // Ensure CAPSULE_API_KEY is available
  const CAPSULE_API_KEY = Bun.env.CAPSULE_API_KEY;
  if (!CAPSULE_API_KEY) {
    return new Response("CAPSULE_API_KEY not set", { status: 500 });
  }

  // Initialize Capsule client and import session
  // This replaces loading a user share from the database and setting it on the client with pregen wallets.
  const capsuleClient = new CapsuleServer(Environment.BETA, CAPSULE_API_KEY);
  await capsuleClient.importSession(session);

  // Capsule client can now be used to sign transactions, etc., with the session imported.
  // Reference other handlers for examples of how to use the Capsule client with signers.
  return new Response("signWithCapsuleSession", { status: 200 });
};
