import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSdk } from "@/lib/canton";

export const runtime = "nodejs";

interface PrepareBody {
  partyId?: string;
  amount?: string;
  instrumentId?: string;
}

export async function POST(request: Request) {
  let body: PrepareBody;
  try {
    body = (await request.json()) as PrepareBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { partyId, amount, instrumentId = "Amulet" } = body;
  if (!partyId || !amount) {
    return NextResponse.json(
      { error: "partyId and amount are required" },
      { status: 400 },
    );
  }

  try {
    const sdk = await getSdk();
    if (!sdk.userLedger || !sdk.tokenStandard) {
      return NextResponse.json({ error: "SDK not fully initialized" }, { status: 500 });
    }

    await sdk.setPartyId(partyId);

    // DevNet/LocalNet only: AmuletRules exposes a Tap choice that mints
    // test Amulet directly to the actor. Same prepare → Para-sign → execute
    // pattern as preapproval/transfer.
    const [command, disclosedContracts] = await sdk.tokenStandard.createTap(
      partyId,
      amount,
      { instrumentId },
    );
    if (!command) {
      return NextResponse.json(
        { error: "createTap returned no command" },
        { status: 502 },
      );
    }

    const commandId = randomUUID();
    const prepared = await sdk.userLedger.prepareSubmission(
      [command],
      commandId,
      disclosedContracts,
    );

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
