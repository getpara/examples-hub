export function parseJsonMessage(message: string, kind: "query" | "execute"): Record<string, object> {
  try {
    return JSON.parse(message);
  } catch (err) {
    throw new Error(`Invalid JSON in ${kind} message.`, { cause: err });
  }
}
