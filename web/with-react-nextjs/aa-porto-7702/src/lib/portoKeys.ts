import type { Key } from "porto/viem";

export function countKeysByRole(keys: readonly Key.Key[], role: Key.Key["role"]) {
  return keys.filter((key) => key.role === role).length;
}
