import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'cpsl-pill',
  styleUrl: 'cpsl-pill.scss',
  shadow: true,
})
export class CpslPill {
  /**
   * Text of the pill.
   */
  @Prop() text: string;

  render() {
    return (
      <Host>
        <div class="pill-container">
          <span>{this.text}</span>
        </div>
      </Host>
    );
  }
}
