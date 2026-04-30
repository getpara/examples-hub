import { NextResponse } from "next/server";
import { getSdk } from "@/lib/canton";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { partyId?: string; instrumentId?: string };
  try {
    body = (await request.json()) as { partyId?: string; instrumentId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { partyId, instrumentId = "Amulet" } = body;
  if (!partyId) {
    return NextResponse.json({ error: "partyId is required" }, { status: 400 });
  }

  try {
    const sdk = await getSdk();
    if (!sdk.tokenStandard) {
      return NextResponse.json({ error: "SDK not fully initialized" }, { status: 500 });
    }

    await sdk.setPartyId(partyId);

    // Sum unlocked holdings for the configured instrument. listHoldingUtxos
    // returns PrettyContract<Holding>[]; the Daml view sits on
    // interfaceViewValue ({ amount, instrumentId: { id }, ... }).
    const utxos = await sdk.tokenStandard.listHoldingUtxos(false);
    const total = utxos
      .filter((h) => h.interfaceViewValue?.instrumentId?.id === instrumentId)
      .reduce((sum, h) => sum + Number(h.interfaceViewValue?.amount ?? 0), 0);

    return NextResponse.json({
      partyId,
      instrumentId,
      amount: total.toString(),
      utxoCount: utxos.length,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: `Canton listHoldingUtxos failed: ${err instanceof Error ? err.message : "unknown"}`,
      },
      { status: 502 },
    );
  }
}
