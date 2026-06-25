import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://api.vaults.fyi";

/**
 * Catch-all proxy that forwards every /api/vaultsfyi/* request to api.vaults.fyi
 * with the server-side x-api-key header attached. Keeps VAULTS_FYI_API_KEY out
 * of the browser bundle.
 *
 * The @vaultsfyi/sdk client in src/lib/vaultsFyi.ts is configured with
 * apiBaseUrl = `${window.location.origin}/api/vaultsfyi`, so SDK calls land
 * here first and the upstream service sees them with the correct auth header.
 *
 * For production deploys: this route works as-is on Vercel / Next.js hosts.
 * If you self-host or split frontend/backend, replicate the header injection
 * in your own gateway.
 */
async function proxy(
  request: NextRequest,
  params: Promise<{ path: string[] }>,
) {
  const apiKey = process.env.VAULTS_FYI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "VAULTS_FYI_API_KEY is not set on the server. Add it to .env.local and restart.",
      },
      { status: 500 },
    );
  }

  const { path } = await params;
  const url = new URL(`${API_BASE}/${path.join("/")}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  const upstream = await fetch(url, {
    method: request.method,
    headers: {
      "x-api-key": apiKey,
      Accept: "application/json",
    },
  });

  const body = await upstream.text();
  return new NextResponse(body, {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("Content-Type") ?? "application/json",
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxy(request, params);
}
