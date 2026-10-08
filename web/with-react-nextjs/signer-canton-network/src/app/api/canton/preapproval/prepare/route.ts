import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSdk } from "@/lib/server/canton";

export const runtime = "nodejs";

interface PrepareBody {
  partyId?: string;
}

export async function POST(request: Request) {
  let body: PrepareBody;
  try {
    body = (await request.json()) as PrepareBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { partyId } = body;
  if (!partyId) {
    return NextResponse.json({ error: "partyId is required" }, { status: 400 });
  }

  try {
    const sdk = await getSdk();
    if (!sdk.userLedger || !sdk.validator || !sdk.tokenStandard) {
      return NextResponse.json({ error: "SDK not fully initialized" }, { status: 500 });
    }

    await sdk.setPartyId(partyId);

    const providerParty = await sdk.validator.getValidatorUser();
    const dsoPartyId = await sdk.tokenStandard.getInstrumentAdmin();

    const command = await sdk.userLedger.createTransferPreapprovalCommand(
      providerParty,
      partyId,
      dsoPartyId,
    );
    if (!command) {
      return NextResponse.json(
        { error: "createTransferPreapprovalCommand returned no command" },
        { status: 502 },
      );
    }

    const commandId = randomUUID();
    const prepared = await sdk.userLedger.prepareSubmission([command], commandId);

    return NextResponse.json({
      preparedTransactionHash: prepared.preparedTransactionHash,
      prepared,
      commandId,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: `Canton prepareSubmission failed: ${err instanceof Error ? err.message : "unknown"}`,
      },
      { status: 502 },
    );
  }
}
