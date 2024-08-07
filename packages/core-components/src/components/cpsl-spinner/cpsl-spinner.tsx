import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'cpsl-spinner',
  styleUrl: 'cpsl-spinner.scss',
  shadow: true,
})
export class CpslSpinner {
  /**
   * Size of the spinner in pixels.
   * Default is 50.
   */
  @Prop() size?: number = 54;

  /**
   * Rotation speed of the spinner in seconds.
   * Default is 1.
   */
  @Prop() speed?: number = 1;

  render() {
    return (
      <Host
        style={{
          'height': `${this.size}px`,
          'width': `${this.size}px`,
          'animation': `spin ${this.speed}s linear infinite`,
          '-webkit-animation': `spin ${this.speed}s linear infinite`,
          '-moz-animation': `spin ${this.speed}s linear infinite`,
        }}
      >
        <svg height={this.size} width={this.size} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 54" fill="none">
          <path
            d="M43.1586 17C39.8082 11.5978 33.8243 8 27 8C16.5066 8 8 16.5066 8 27C8 37.4934 16.5066 46 27 46C33.8242 46 39.8082 42.4022 43.1586 37"
            stroke-width="6"
            stroke-linecap="round"
          />
          <circle cx="45" cy="27" r="5" />
        </svg>
      </Host>
    );
  }
}
