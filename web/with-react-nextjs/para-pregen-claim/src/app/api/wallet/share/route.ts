import { NextRequest, NextResponse } from "next/server";
import type { GetWalletShareResponse, PregenWalletRequestBody } from "@/lib/pregenWalletApi";
import { preparePregenWalletClaim } from "@/lib/server/pregenClaimService";
import { getPregenClaimServiceDependencies } from "@/lib/server/serverDependencies";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: PregenWalletRequestBody = await request.json();
    const response = await preparePregenWalletClaim({ email: body.email }, getPregenClaimServiceDependencies());

    return NextResponse.json<GetWalletShareResponse>(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to prepare pregen wallet claim";

    return NextResponse.json<GetWalletShareResponse>(
      { success: false, error: message },
      { status: message === "A valid email is required" ? 400 : 500 }
    );
  }
}
