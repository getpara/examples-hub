import { Component, Host, Prop, h } from '@stencil/core';
import Prando from '../../lib/prando';
import { Color, COLORS } from '../../utils/prand';

const SingleArc = (rotation: number) => (
  <svg
    class={{
      rotate90: rotation === 1,
      rotate180: rotation === 2,
      rotate270: rotation === 3,
    }}
    viewBox="0 0 12 12"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_674_66)">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
      />
    </g>
    <defs>
      <clipPath id="clip0_674_66">
        <rect width="12" height="12" />
      </clipPath>
    </defs>
  </svg>
);

const DoubleArc = (rotation: number) => (
  <svg
    class={{
      rotate90: rotation === 1,
      rotate180: rotation === 2,
      rotate270: rotation === 3,
    }}
    viewBox="0 0 12 12"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_674_255)">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18ZM12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
      />
    </g>
    <defs>
      <clipPath id="clip0_674_255">
        <rect width="12" height="12" />
      </clipPath>
    </defs>
  </svg>
);

const BASE_PATTERNS = [
  [
    [0, 0, 0, 0],
    [0, 1, 3, 2],
  ],
  [
    [1, 1, 0, 0],
    [0, 1, 3, 2],
  ],
  [
    [0, 1, 0, 1],
    [0, 1, 3, 2],
  ],
  [
    [0, 0, 1, 1],
    [0, 1, 3, 2],
  ],
  [
    [1, 0, 1, 0],
    [0, 1, 3, 2],
  ],
  [
    [1, 1, 1, 1],
    [0, 1, 3, 2],
  ],
  [
    [0, 0, 0, 0],
    [2, 3, 1, 0],
  ],
  [
    [1, 1, 1, 1],
    [2, 3, 1, 0],
  ],
  [
    [1, 1, 1, 1],
    [0, 1, 2, 3],
  ],
];

@Component({
  tag: 'cpsl-identicon',
  styleUrl: 'cpsl-identicon.scss',
  shadow: true,
})
export class CpslIdenticon {
  @Prop() hash?: string | undefined;

  /**
   *  The CSS width and height of the identicon.
   *  Default is: 40px.
   */
  @Prop() size: string = '40px';

  @Prop() variant: 'default' | 'avatar' = 'default';

  render() {
    let props;
    const isEmpty = !this.hash;
    if (!isEmpty) props = getIdenticonProps(this.hash);

    return (
      <Host
        class={{
          red: props?.color === 'red',
          orange: props?.color === 'orange',
          yellow: props?.color === 'yellow',
          green: props?.color === 'green',
          blue: props?.color === 'blue',
          purple: props?.color === 'purple',
          empty: !props?.color && !this.hash,
          avatar: this.variant === 'avatar',
        }}
        style={{
          width: this.size,
          height: this.size,
        }}
      >
        {props?.shapes &&
          props?.rotations &&
          props.shapes.map((isDouble, index) => {
            return isDouble ? DoubleArc(props.rotations[index]) : SingleArc(props.rotations[index]);
          })}
      </Host>
    );
  }
}

const PRANDO_INTS = [COLORS.length, BASE_PATTERNS.length, 16];

function getIdenticonProps(seed: string): { color: Color; shapes: boolean[]; rotations: number[] } {
  const rng = new Prando(seed);

  const [iColor, iPattern, iDeviation] = PRANDO_INTS.map(len => rng.nextInt(0, len - 1));

  const deviationIndex = Math.floor(iDeviation / 4);
  const [isDeviateShape, isDeviateFlip] = [iDeviation % 2 === 1, iDeviation % 4 >= 2];

  return {
    color: COLORS[iColor],
    shapes: BASE_PATTERNS[iPattern][0].map((s, i) => {
      return i === deviationIndex ? (isDeviateShape ? (s === 1 ? false : true) : s === 1) : s === 1;
    }),
    rotations: BASE_PATTERNS[iPattern][1].map((r, i) => (i === deviationIndex ? (isDeviateFlip ? (r + 2) % 4 : r) : r)),
  };
}
