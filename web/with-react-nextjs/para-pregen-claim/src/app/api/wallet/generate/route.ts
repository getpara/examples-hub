import { NextRequest, NextResponse } from "next/server";
import { generatePregenWalletForEmail } from "@/lib/para/pregenClaimService";
import { getPregenClaimServiceDependencies } from "@/lib/para/serverDependencies";
import type { GenerateWalletRequestBody, GenerateWalletResponse } from "@/lib/para/types";

export async function POST(request: NextRequest) {
  try {
    const body: GenerateWalletRequestBody = await request.json();
    const response = await generatePregenWalletForEmail(
      { email: body.email },
      getPregenClaimServiceDependencies(),
    );

    return NextResponse.json<GenerateWalletResponse>(response);
  } catch (error) {
    return NextResponse.json<GenerateWalletResponse>(
      { success: false, error: getErrorMessage(error) },
      { status: getErrorStatus(error) },
    );
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Failed to generate pregen wallet";
}

function getErrorStatus(error: unknown): number {
  return error instanceof Error && error.message === "A valid email is required" ? 400 : 500;
}
