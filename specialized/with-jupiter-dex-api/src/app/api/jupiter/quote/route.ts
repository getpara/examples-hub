import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { inputMint, outputMint, amount, slippageBps = 50 } = await request.json();

    if (!inputMint || !outputMint || !amount) {
      return NextResponse.json(
        { error: "Missing required parameters: inputMint, outputMint, amount" },
        { status: 400 }
      );
    }

    const quoteUrl = new URL("https://api.jup.ag/swap/v1/quote");
    quoteUrl.searchParams.append("inputMint", inputMint);
    quoteUrl.searchParams.append("outputMint", outputMint);
    quoteUrl.searchParams.append("amount", amount.toString());
    quoteUrl.searchParams.append("slippageBps", slippageBps.toString());
    quoteUrl.searchParams.append("restrictIntermediateTokens", "true");

    const response = await fetch(quoteUrl);

    if (!response.ok) {
      throw new Error(`Failed to get quote: ${response.statusText}`);
    }

    const quoteData = await response.json();
    return NextResponse.json(quoteData);
  } catch (error) {
    console.error("Error getting quote:", error);
    return NextResponse.json({ error: "Failed to get quote" }, { status: 500 });
  }
}
