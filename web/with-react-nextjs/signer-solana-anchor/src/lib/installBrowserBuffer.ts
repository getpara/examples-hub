import { Buffer } from "buffer";

export function installBrowserBuffer() {
  if (typeof globalThis !== "undefined" && !("Buffer" in globalThis)) {
    (globalThis as typeof globalThis & { Buffer: typeof Buffer }).Buffer = Buffer;
  }
}
