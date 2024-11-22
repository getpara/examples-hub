import { parseToRgba, rgba } from 'color2k';
import { CustomBorderRadii, CustomPalette } from '../../interface.js';
import { overlay } from 'color-blend';

export const isColor = strColor => {
  const s = new Option().style;
  s.color = strColor;
  return s.color !== '';
};

const toKebabCase = (pascal: string) => pascal.replace(/([a-z0–9])([A-Z])/g, '$1-$2').toLowerCase();

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

export const getCssColors = (customPalette: CustomPalette): { [k: string]: string } => buildVars('--cpsl-color', customPalette);
export const getCssBorderRadii = (customBorderRadii: CustomBorderRadii): { [k: string]: string } => buildVars('--cpsl-border-radius', customBorderRadii);

export const overlayMix = (baseColor: string, overlayColor: string) => {
  const baseRGBA = parseToRgba(baseColor);
  const overlayRGBA = parseToRgba(overlayColor);

  const finalRGBA = overlay({ r: baseRGBA[0], g: baseRGBA[1], b: baseRGBA[2], a: 0.1 }, { r: overlayRGBA[0], g: overlayRGBA[1], b: overlayRGBA[2], a: overlayRGBA[3] });

  return rgba(finalRGBA.r, finalRGBA.g, finalRGBA.b, finalRGBA.a);
};
