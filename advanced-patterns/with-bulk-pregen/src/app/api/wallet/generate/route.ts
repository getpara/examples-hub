import { NextRequest, NextResponse } from "next/server";
import type { GenerateWalletResponse } from "@/lib/pregenWalletApi";
import {
  generatePregenWalletForHandle,
  InvalidWalletRequestError,
  type GenerateWalletInput,
} from "@/lib/server/bulkPregenService";
import { getBulkPregenServiceDependencies } from "@/lib/server/serverDependencies";

export async function POST(request: NextRequest) {
  try {
    const body: GenerateWalletInput = await request.json();
    const response = await generatePregenWalletForHandle(body, getBulkPregenServiceDependencies());

    return NextResponse.json<GenerateWalletResponse>(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate the pregen wallet";

    return NextResponse.json<GenerateWalletResponse>(
      { success: false, error: message },
      { status: error instanceof InvalidWalletRequestError ? 400 : 500 }
    );
  }
}
