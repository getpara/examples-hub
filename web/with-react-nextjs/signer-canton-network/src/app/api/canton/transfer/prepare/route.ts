import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSdk } from "@/lib/canton";

export const runtime = "nodejs";

interface PrepareBody {
  partyId?: string;
  receiverPartyId?: string;
  amount?: string;
  instrumentId?: string;
  memo?: string;
}

export async function POST(request: Request) {
  let body: PrepareBody;
  try {
    body = (await request.json()) as PrepareBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { partyId, receiverPartyId, amount, instrumentId = "Amulet", memo } = body;
  if (!partyId || !receiverPartyId || !amount) {
    return NextResponse.json(
      { error: "partyId, receiverPartyId, and amount are required" },
      { status: 400 },
    );
  }

  try {
    const sdk = await getSdk();
    if (!sdk.userLedger || !sdk.tokenStandard) {
      return NextResponse.json({ error: "SDK not fully initialized" }, { status: 500 });
    }

    // setPartyId hydrates userLedger + tokenStandard with the act-as party
    // and discovers the synchronizer the party lives on. Required before
    // any token-standard call or prepareSubmission.
    await sdk.setPartyId(partyId);

    const [command, disclosedContracts] = await sdk.tokenStandard.createTransfer(
      partyId,
      receiverPartyId,
      amount,
      { instrumentId },
      undefined,
      memo,
    );
    if (!command) {
      return NextResponse.json(
        { error: "createTransfer returned no command" },
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
