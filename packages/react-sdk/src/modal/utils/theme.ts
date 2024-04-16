import { Branding } from '../types/branding.js';

const toKebabCase = (pascal: string) =>
  pascal.replace(/([a-z0–9])([A-Z])/g, '$1-$2').toLowerCase();

// This function handles arrays and objects
const buildVars = (prev: string, obj: any): { [k: string]: string } => {
  let resp = {};

  for (const k in obj) {
    const name = `${prev}-${toKebabCase(k)}`;
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      resp = { ...resp, ...buildVars(name, obj[k]) };
    } else {
      resp[name] = obj[k];
    }
  }

  return resp;
};

export const getCssColors = (branding: Branding): { [k: string]: string } =>
  buildVars('--cpsl-color', branding.colors);

export const getCssBorderRadii = (
  branding: Branding,
): { [k: string]: string } =>
  buildVars('--cpsl-border-radius', branding.borderRadii);

export const mergeBranding = (target: Branding, update: Branding) => {
  for (const [key, value] of Object.entries(update)) {
    if (target.hasOwnProperty(key) && typeof value === typeof target[key]) {
      if (
        ['string', 'number', 'boolean'].includes(typeof value) ||
        Array.isArray(value)
      ) {
        target[key] = value;
      } else {
        if (typeof value === 'object') {
          mergeBranding(target[key], value);
        }
      }
    }
  }
};
