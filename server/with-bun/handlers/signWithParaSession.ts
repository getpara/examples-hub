import { Para as ParaServer, Environment } from "@getpara/server-sdk";

export const signWithParaSession = async (req: Request): Promise<Response> => {
  const { email, session }: { email: string; session: string } = await req.json();

  if (!email || !session) {
    return new Response("Email and session are required in the request body", { status: 400 });
  }

  const PARA_API_KEY = Bun.env.PARA_API_KEY;
  if (!PARA_API_KEY) {
    console.error("Server configuration error: PARA_API_KEY not set");
    return new Response("Server configuration error", { status: 500 });
  }

  const para = new ParaServer(Environment.BETA, PARA_API_KEY, { disableWebSockets: true, disableWorkers: true });

  try {
    await para.importSession(session);

    const wallets = para.wallets;
    if (!wallets || Object.keys(wallets).length === 0) {
      throw new Error("Failed to load wallet details after importing session. Session might be invalid or expired.");
    }

    const responsePayload = {
      route: "signWithParaSession",
      status: "success",
      message:
        "Session imported successfully. Para client instance is now initialized and ready for signing operations (e.g., using methods shown in other signing examples).",
    };

    return new Response(JSON.stringify(responsePayload), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(`Error during signWithParaSession process for ${email}:`, error);
    if (error instanceof Error && error.message.includes("session")) {
      return new Response(`Failed to process session: ${error.message}`, { status: 400 });
    }
    return new Response(`Failed to import session: ${error instanceof Error ? error.message : "Unknown error"}`, {
      status: 500,
    });
  }
};
