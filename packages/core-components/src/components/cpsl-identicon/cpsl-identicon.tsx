import { Component, Host, Prop, h } from '@stencil/core';

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

@Component({
  tag: 'cpsl-identicon',
  styleUrl: 'cpsl-identicon.scss',
  shadow: true,
})
export class CpslIdenticon {
  @Prop() hash: string;

  /**
   *  The size of the identicon.
   *  Default is: 40.
   */
  @Prop() size: number = 40;

  render() {
    const [code, color] = stringToBinaryAndColor(this.hash);
    const shapeA = ((code >> 2) & 1) !== 0;
    const shapeB = ((code >> 3) & 1) !== 0;
    const shapeC = ((code >> 4) & 1) !== 0;
    const shapeD = ((code >> 5) & 1) !== 0;
    const rotationA = (code >> 6) & 3;
    const rotationB = (code >> 7) & 3;
    const rotationC = (code >> 8) & 3;
    const rotationD = (code >> 9) & 3;

    const [shapes, rotations] = [
      [shapeA, shapeB, shapeC, shapeD],
      [rotationA, rotationB, rotationC, rotationD],
    ];

    return (
      <Host
        class={{
          red: color === 'red',
          orange: color === 'orange',
          yellow: color === 'yellow',
          green: color === 'green',
          blue: color === 'blue',
          purple: color === 'purple',
        }}
      >
        {shapes.map((isDouble, index) => {
          return isDouble ? DoubleArc(rotations[index]) : SingleArc(rotations[index]);
        })}
      </Host>
    );
  }
}

type Color = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';

const COLORS: Color[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

function stringToBinaryAndColor(hash: string): [number, Color] {
  const code = (hash.charCodeAt(0) << 24) | (hash.charCodeAt(1) << 16) | (hash.charCodeAt(2) << 8) | hash.charCodeAt(3);

  const color = COLORS[Math.abs(code % 6)];

  return [code, color];
}
