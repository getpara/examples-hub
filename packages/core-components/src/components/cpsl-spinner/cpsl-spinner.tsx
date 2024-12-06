import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'cpsl-spinner',
  styleUrl: 'cpsl-spinner.scss',
  shadow: true,
})
export class CpslSpinner {
  /**
   * Variant of the spinner
   * Default is 'default'.
   */
  @Prop() variant?: 'default' | 'inactive' | 'error' = 'default';

  /**
   * Size of the spinner in pixels.
   * Default is 50.
   */
  @Prop() size?: number = 54;

  /**
   * Width of the spinner arc in pixels.
   * Default is 6.5.
   */
  @Prop() barWidth?: number;

  /**
   * Rotation speed of the spinner in seconds.
   * Default is 1.
   */
  @Prop() speed?: number = 1;

  render() {
    return (
      <Host
        style={{
          ['--height']: `${this.size}px`,
          ['--width']: `${this.size}px`,
          ['--bar-width']: `${this.barWidth ? this.barWidth : this.size * 0.12}px`,
        }}
      >
        <div class={{ loader: true, [this.variant]: true }} />
      </Host>
    );
  }
}
