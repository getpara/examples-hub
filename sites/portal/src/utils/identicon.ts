import crypto from 'crypto-browserify';

export type Color = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';

export const COLORS: Color[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

export const BACKGROUNDS: Record<Color, [string, string]> = {
  red: ['#FF4270', '#FF7C7C'],
  orange: ['#F45532', '#FF9B63'],
  yellow: ['#FFA756', '#FBFF47'],
  green: ['#0CAE60', '#7BFFD0'],
  blue: ['#476FFF', '#47C8FF'],
  purple: ['#9747FF', '#DA47FF'],
};

export function stringToBinaryAndColor(str: string): [number, Color] {
  const hash = crypto.createHash('sha1').update(Buffer.from(str, 'utf8')).digest('binary');
  const code = (hash.charCodeAt(0) << 24) | (hash.charCodeAt(1) << 16) | (hash.charCodeAt(2) << 8) | hash.charCodeAt(3);

  const color = COLORS[Math.abs(code % 6)];

  return [code, color];
}

export function getBackground(color: Color): string {
  const [from, to] = BACKGROUNDS[color];

  return `linear-gradient(136deg, ${from} 6.86%, ${to} 93.78%);`;
}
