import { TokenInfo } from "@/types";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // SOL and USDC mint addresses
    const solMint = "So11111111111111111111111111111111111111112";
    const usdcMint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
    const targetMints = [solMint, usdcMint];

    const tokenPromises = targetMints.map((mint) =>
      fetch(`https://api.jup.ag/tokens/v1/token/${mint}`).then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch token ${mint}: ${response.statusText}`);
        }
        return response.json();
      })
    );

    const tokenDetails: TokenInfo[] = await Promise.all(tokenPromises);

    return NextResponse.json(tokenDetails);
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return NextResponse.json({ error: "Failed to fetch tokens" }, { status: 500 });
  }
}
