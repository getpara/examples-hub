import "server-only";

import { NextResponse } from "next/server";
import type { PreparedSubmission } from "@/lib/cantonTypes";
import { getSdk } from "@/lib/server/canton";

interface ExecuteBody {
  partyId?: string;
  prepared?: PreparedSubmission;
  signatureBase64?: string;
  publicKeyBase64?: string;
  commandId?: string;
}

export async function executeSignedSubmission(request: Request) {
  let body: ExecuteBody;
  try {
    body = (await request.json()) as ExecuteBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { partyId, prepared, signatureBase64, publicKeyBase64, commandId } = body;
  if (!partyId || !prepared || !signatureBase64 || !publicKeyBase64 || !commandId) {
    return NextResponse.json(
      {
        error:
          "partyId, prepared, signatureBase64, publicKeyBase64, and commandId are required",
      },
      { status: 400 },
    );
  }

  try {
    const sdk = await getSdk();
    if (!sdk.userLedger) {
      return NextResponse.json({ error: "SDK not fully initialized" }, { status: 500 });
    }

    await sdk.setPartyId(partyId);

    const updateId = await sdk.userLedger.executeSubmission(
      prepared,
      signatureBase64,
      publicKeyBase64,
      commandId,
    );

    return NextResponse.json({ updateId });
  } catch (err) {
    return NextResponse.json(
      {
        error: `Canton executeSubmission failed: ${err instanceof Error ? err.message : "unknown"}`,
      },
      { status: 502 },
    );
  }
}
