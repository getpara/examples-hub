import { NextRequest, NextResponse } from "next/server";
import type { SigningRequestBody, SigningResponse } from "@/lib/signingApi";
import { signAndBroadcastTransaction } from "@/lib/server/serverSigning";

export async function POST(request: NextRequest) {
  try {
    const body: Partial<SigningRequestBody> = await request.json();

    if (!body.session || !body.transaction) {
      return NextResponse.json<SigningResponse>(
        { error: "Provide both `session` and `transaction` in the request body." },
        { status: 400 }
      );
    }

    const result = await signAndBroadcastTransaction({ session: body.session, transaction: body.transaction });

    return NextResponse.json<SigningResponse>(result);
  } catch (error) {
    console.error("Error in transaction signing handler:", error);

    return NextResponse.json<SigningResponse>(
      {
        error: "Failed to sign or broadcast transaction",
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
