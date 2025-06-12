import { ModalBuilderConfig } from '../types';

function isPlainObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => isEqual(item, b[index]));
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(key => isEqual(a[key], b[key]));
  }
  return false;
}

export function getConfigDiff<T extends Record<string, any>>(current: T, defaults: T): Partial<T> | undefined {
  const diff: Partial<T> = {};
  let hasDifferences = false;

  for (const key in current) {
    if (!Object.prototype.hasOwnProperty.call(current, key)) continue;
    const currentValue = current[key];
    const defaultValue = defaults[key];

    if (isPlainObject(currentValue) && isPlainObject(defaultValue)) {
      const nestedDiff = getConfigDiff(currentValue, defaultValue);
      if (nestedDiff && Object.keys(nestedDiff).length) {
        diff[key] = nestedDiff as T[Extract<keyof T, string>];
        hasDifferences = true;
      }
    } else if (!isEqual(currentValue, defaultValue)) {
      diff[key] = currentValue;
      hasDifferences = true;
    }
  }

  return hasDifferences ? diff : undefined;
}

export function getModalConfigDiff(
  config: ModalBuilderConfig,
  defaultConfig: ModalBuilderConfig,
): Partial<ModalBuilderConfig> | undefined {
  return getConfigDiff(config, defaultConfig);
}
