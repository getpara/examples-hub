import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSdk } from "@/lib/canton";

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
    if (!sdk.userLedger || !sdk.validator) {
      return NextResponse.json({ error: "SDK not fully initialized" }, { status: 500 });
    }

    // setPartyId hydrates userLedger + tokenStandard with the act-as party
    // and discovers the synchronizer the party lives on. Required before any
    // prepareSubmission call.
    await sdk.setPartyId(partyId);

    const providerParty = await sdk.validator.getValidatorUser();

    // splice-wallet >= 0.1.11 requires the DSO party in the proposal payload.
    // The validator's scan-proxy exposes it directly; the SDK doesn't surface
    // a typed wrapper, so we reach into the internal client.
    const dsoRes = await (
      sdk.validator as unknown as {
        scanProxyClient: {
          get: (path: string) => Promise<{ dso_party_id: string }>;
        };
      }
    ).scanProxyClient.get("/v0/scan-proxy/dso-party-id");

    const command = await sdk.userLedger.createTransferPreapprovalCommand(
      providerParty,
      partyId,
      dsoRes.dso_party_id,
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
