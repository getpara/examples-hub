export function jsonParse<T = any>(data: string | null | undefined, validate?: (res: any) => res is T): T | undefined {
  try {
    const res = JSON.parse(data);

    if (validate && !validate(res)) {
      return undefined;
    }

    return res as T;
  } catch {
    return undefined;
  }
}
