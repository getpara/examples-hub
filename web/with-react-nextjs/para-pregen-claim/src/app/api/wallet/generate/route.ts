import { NextRequest, NextResponse } from "next/server";
import type { GenerateWalletResponse, PregenWalletRequestBody } from "@/lib/pregenWalletApi";
import { generatePregenWalletForEmail } from "@/lib/server/pregenClaimService";
import { getPregenClaimServiceDependencies } from "@/lib/server/serverDependencies";

export async function POST(request: NextRequest) {
  try {
    const body: PregenWalletRequestBody = await request.json();
    const response = await generatePregenWalletForEmail({ email: body.email }, getPregenClaimServiceDependencies());

    return NextResponse.json<GenerateWalletResponse>(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate pregen wallet";

    return NextResponse.json<GenerateWalletResponse>(
      { success: false, error: message },
      { status: message === "A valid email is required" ? 400 : 500 }
    );
  }
}
