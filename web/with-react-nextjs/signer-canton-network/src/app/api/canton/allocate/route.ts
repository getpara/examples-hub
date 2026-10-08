import { NextResponse } from "next/server";
import type { GeneratedParty } from "@/lib/cantonTypes";
import { getSdk } from "@/lib/server/canton";

export const runtime = "nodejs";

interface AllocateBody {
  signatureBase64?: string;
  generatedParty?: GeneratedParty;
}

export async function POST(request: Request) {
  let body: AllocateBody;
  try {
    body = (await request.json()) as AllocateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { signatureBase64, generatedParty } = body;
  if (!signatureBase64 || !generatedParty) {
    return NextResponse.json(
      { error: "signatureBase64 and generatedParty are required" },
      { status: 400 },
    );
  }

  let allocatedParty;
  try {
    const sdk = await getSdk();
    allocatedParty = await sdk.userLedger?.allocateExternalParty(signatureBase64, generatedParty);
  } catch (err) {
    return NextResponse.json(
      { error: `Canton allocateExternalParty failed: ${err instanceof Error ? err.message : "unknown"}` },
      { status: 502 },
    );
  }

  if (!allocatedParty) {
    return NextResponse.json({ error: "Canton returned no allocated party" }, { status: 502 });
  }

  return NextResponse.json({ partyId: allocatedParty.partyId });
}
