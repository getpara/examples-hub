import { NextRequest, NextResponse } from "next/server";
import { preparePregenWalletClaim } from "@/lib/para/pregenClaimService";
import { getPregenClaimServiceDependencies } from "@/lib/para/serverDependencies";
import type { GetWalletShareResponse } from "@/lib/para/types";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const response = await preparePregenWalletClaim(
      { email: body.email },
      getPregenClaimServiceDependencies(),
    );

    return NextResponse.json<GetWalletShareResponse>(response);
  } catch (error) {
    return NextResponse.json<GetWalletShareResponse>(
      { success: false, error: getErrorMessage(error) },
      { status: getErrorStatus(error) },
    );
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Failed to prepare pregen wallet claim";
}

function getErrorStatus(error: unknown): number {
  return error instanceof Error && error.message === "A valid email is required" ? 400 : 500;
}
