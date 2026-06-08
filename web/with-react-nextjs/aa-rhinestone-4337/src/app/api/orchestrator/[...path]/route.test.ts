import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { POST } from "./route";

const originalApiKey = process.env.RHINESTONE_API_KEY;

const createIntentOperationsRequest = (body: unknown) =>
  new NextRequest("https://example.com/api/orchestrator/intent-operations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

const createForwardedResponse = () =>
  new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });

describe("Rhinestone orchestrator proxy", () => {
  beforeEach(() => {
    process.env.RHINESTONE_API_KEY = "test-rhinestone-api-key";
  });

  afterEach(() => {
    vi.restoreAllMocks();

    if (originalApiKey === undefined) {
      delete process.env.RHINESTONE_API_KEY;
    } else {
      process.env.RHINESTONE_API_KEY = originalApiKey;
    }
  });

  it("rejects intent operations without destination executions before forwarding", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(createForwardedResponse());

    const response = await POST(createIntentOperationsRequest({}), {
      params: Promise.resolve({ path: ["intent-operations"] }),
    });

    await expect(response.json()).resolves.toEqual({
      error: "Contract not whitelisted",
    });
    expect(response.status).toBe(403);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("forwards intent operations with whitelisted destination executions", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(createForwardedResponse());

    const response = await POST(
      createIntentOperationsRequest({
        signedIntentOp: {
          signedMetadata: {
            account: {
              accountContext: {
                destinationExecutions: [
                  { to: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" },
                ],
              },
            },
          },
        },
      }),
      {
        params: Promise.resolve({ path: ["intent-operations"] }),
      }
    );

    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(response.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://v1.orchestrator.rhinestone.dev/intent-operations",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "test-rhinestone-api-key",
        },
      })
    );
  });

  it("does not validate unrelated paths that only contain the protected path name as a substring", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(createForwardedResponse());

    const response = await POST(createIntentOperationsRequest({}), {
      params: Promise.resolve({ path: ["not-intent-operations"] }),
    });

    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(response.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledOnce();
  });
});
