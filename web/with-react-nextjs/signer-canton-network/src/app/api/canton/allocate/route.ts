import { NextResponse } from "next/server";
import { getSdk } from "@/lib/canton";

export const runtime = "nodejs";

interface AllocateBody {
  signatureBase64?: string;
  // The full object returned by generateExternalParty. We pass it back
  // to allocateExternalParty unmodified.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generatedParty?: any;
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
