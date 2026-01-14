import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { quoteResponse, userPublicKey } = await request.json();

    if (!quoteResponse || !userPublicKey) {
      return NextResponse.json({ error: "Missing required parameters: quoteResponse, userPublicKey" }, { status: 400 });
    }

    const swapResponse = await fetch("https://api.jup.ag/swap/v1/swap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quoteResponse,
        userPublicKey,
        dynamicComputeUnitLimit: true,
        dynamicSlippage: true,
        prioritizationFeeLamports: {
          priorityLevelWithMaxLamports: {
            maxLamports: 1000000,
            priorityLevel: "veryHigh",
          },
        },
      }),
    });

    if (!swapResponse.ok) {
      throw new Error(`Failed to get swap transaction: ${swapResponse.statusText}`);
    }

    const swapData = await swapResponse.json();
    return NextResponse.json(swapData);
  } catch (error) {
    console.error("Error getting swap transaction:", error);
    return NextResponse.json({ error: "Failed to get swap transaction" }, { status: 500 });
  }
}
