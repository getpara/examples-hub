import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'cpsl-avatar',
  styleUrl: 'cpsl-avatar.scss',
  shadow: true,
})
export class CpslAvatar {
  /**
   * The alternate text for the avatar image.
   */
  @Prop() alt?: string;

  /**
   * The source of the avatar image.
   */
  @Prop() src: string;

  /**
   * The variant of the avatar.
   * Options are: `"round"`, `"square".
   * Default is: `"square"`.
   */
  @Prop() variant?: 'round' | 'square' = 'square';

  render() {
    return (
      <Host>
        <span class={{ round: this.variant === 'round' }}>
          <img src={this.src} alt={this.alt ?? 'avatar'} />
        </span>
      </Host>
    );
  }
}
