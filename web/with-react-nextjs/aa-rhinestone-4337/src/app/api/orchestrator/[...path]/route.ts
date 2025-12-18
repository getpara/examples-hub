import { NextRequest, NextResponse } from "next/server";
const ORCHESTRATOR_URL = "https://v1.orchestrator.rhinestone.dev";

// If dont need any validation, can set this to true
const ALLOW_ALL_CONTRACTS = false;

// Whitelisted contracts when allow all is disabled
const WHITELISTED_CONTRACTS = new Set([
  "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", // Base USDC
  "0x4200000000000000000000000000000000000006", // Weth address
]);

const getApiKey = () => {
  const apiKey = process.env.RHINESTONE_API_KEY;
  if (!apiKey) {
    throw new Error("RHINESTONE_API_KEY is not configured");
  }
  return apiKey;
};

// validate contract addresses in destinationOps
const validateDestinationOps = (body: any): boolean => {
  if (ALLOW_ALL_CONTRACTS) return true;

  const destinationOps =
    body.signedIntentOp?.signedMetadata?.account?.accountContext
      ?.destinationExecutions;

  if (!destinationOps) return true;

  for (const op of destinationOps) {
    const address = op.to?.toLowerCase();
    if (!address || !WHITELISTED_CONTRACTS.has(address)) {
      console.log(`Blocked non-whitelisted contract: ${address}`);
      return false;
    }
  }

  return true;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, await params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, await params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, await params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, await params);
}

async function handleRequest(request: NextRequest, params: { path: string[] }) {
  try {
    const apiKey = getApiKey();
    const path = params.path.join("/");
    const url = new URL(request.url);
    const targetUrl = new URL(`${ORCHESTRATOR_URL}/${path}`);
    targetUrl.search = url.search;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    };

    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      const body = await request.text();
      if (body) {
        // Validate intent operations
        if (path.includes("intent-operations")) {
          const parsedBody = JSON.parse(body);
          if (!validateDestinationOps(parsedBody)) {
            return NextResponse.json(
              { error: "Contract not whitelisted" },
              { status: 403 }
            );
          }
        }
        fetchOptions.body = body;
      }
    }

    const response = await fetch(targetUrl.toString(), fetchOptions);
    const responseBody = await response.text();

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal proxy error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
