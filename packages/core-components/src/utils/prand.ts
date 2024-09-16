import Prando from '../lib/prando';

export type Color = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';

export const COLORS: Color[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

const GRADIENTS = {
  red: ['#FF4270', '#FF7C7C'],
  orange: ['#F45532', '#FF9B63'],
  yellow: ['#FFA756', '#FBFF47'],
  green: ['#0CAE60', '#7BFFD0'],
  blue: ['#476FFF', '#47C8FF'],
  purple: ['#9747FF', '#DA47FF'],
};

export function getPseudoRandomBackground(seed: string): string {
  const rng = new Prando(seed);

  const [start, stop] = GRADIENTS[COLORS[rng.nextInt(0, COLORS.length - 1)]];

  return `linear-gradient(136deg, ${start} 6.86%, ${stop} 93.78%)`;
}
