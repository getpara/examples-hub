import { NextResponse } from "next/server";
import bs58 from "bs58";
import { getSdk } from "@/lib/canton";

export const runtime = "nodejs";

interface GenerateBody {
  solanaAddress?: string;
  partyHint?: string;
}

export async function POST(request: Request) {
  let body: GenerateBody;
  try {
    body = (await request.json()) as GenerateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { solanaAddress, partyHint } = body;
  if (!solanaAddress || !partyHint) {
    return NextResponse.json(
      { error: "solanaAddress and partyHint are required" },
      { status: 400 },
    );
  }

  // Solana address (base58) → raw 32-byte Ed25519 → base64 for Canton.
  let rawPubkey: Uint8Array;
  try {
    rawPubkey = bs58.decode(solanaAddress);
  } catch {
    return NextResponse.json({ error: "Invalid Solana address (bad base58)" }, { status: 400 });
  }
  const publicKeyBase64 = Buffer.from(rawPubkey).toString("base64");

  let generatedParty;
  try {
    const sdk = await getSdk();
    generatedParty = await sdk.userLedger?.generateExternalParty(publicKeyBase64, partyHint);
  } catch (err) {
    return NextResponse.json(
      { error: `Canton generateExternalParty failed: ${err instanceof Error ? err.message : "unknown"}` },
      { status: 502 },
    );
  }

  if (!generatedParty) {
    return NextResponse.json({ error: "Canton returned no generated party" }, { status: 502 });
  }

  return NextResponse.json({
    multiHash: generatedParty.multiHash,
    generatedParty,
  });
}
