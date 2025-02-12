import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { simulateVerifyToken } from "../utils/auth-utils";

interface RequestBody {
  email: string;
  session: string;
}

/**
 * Handles signing with Para Session.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Promise<Response>} - The response indicating the session was processed.
 */
export const signWithParaSession = async (req: Request): Promise<Response> => {
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

  // Ensure PARA_API_KEY is available
  const PARA_API_KEY = Bun.env.PARA_API_KEY;
  if (!PARA_API_KEY) {
    return new Response("PARA_API_KEY not set", { status: 500 });
  }

  // Initialize Para client and import session
  // This replaces loading a user share from the database and setting it on the client with pregen wallets.
  const para = new ParaServer(Environment.BETA, PARA_API_KEY);
  await para.importSession(session);

  // Para client can now be used to sign transactions, etc., with the session imported.
  // Reference other handlers for examples of how to use the Para client with signers.
  return new Response("signWithParaSession", { status: 200 });
};
