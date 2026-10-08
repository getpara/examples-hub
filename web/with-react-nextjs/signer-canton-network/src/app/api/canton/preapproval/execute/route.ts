import { executeSignedSubmission } from "@/lib/server/executeSubmission";

export const runtime = "nodejs";

export function POST(request: Request) {
  return executeSignedSubmission(request);
}
