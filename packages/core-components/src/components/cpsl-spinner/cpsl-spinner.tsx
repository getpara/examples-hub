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
          height: `${this.size}px`,
          width: `${this.size}px`,
          ['--bar-width']: `${this.size * 0.12}px`,
        }}
      >
        <div class="loader" />
      </Host>
    );
  }
}
