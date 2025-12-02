import { Component, Host, h, Prop } from '@stencil/core';
import { IconType } from '../../interface.js';
import { Icons } from '../../assets/icons/index.js';

@Component({
  tag: 'cpsl-icon',
  styleUrl: 'cpsl-icon.scss',
  shadow: true,
})
export class CpslIcon {
  /**
   * The external source of the icon. If both `icon` and `src` are provided, `icon` will be used.
   */
  @Prop() src?: string;

  /**
   * The CSS size of the icon.
   */
  @Prop() size?: string;

  /**
   * Whether to invert the icon's colors.
   */
  @Prop() invert?: boolean;

  /**
   * The CSS length to inset the icon.
   */
  @Prop() inset: string = '0px';

  /**
   * The name of the icon. If both `icon` and `src` are provided, `icon` will be used.
   */
  @Prop() icon?: IconType;

  /**
   * Whether the icon should be rounded.
   */
  @Prop() radius?: 'none' | 'theme' | 'full' = 'none';

  /**
   * The background CSS property of the icon.
   */
  @Prop() background?: string;

  /**
   * The color of the icon.
   */
  @Prop() color?: string;

  /**
   * The border CSS property of the icon.
   */
  @Prop() border?: string;

  render() {
    return (
      <Host
        part="icon"
        role="img"
        style={{
          ...(this.inset ? { ['--inset']: this.inset } : {}),
          ...(this.size ? { ['--height']: this.size, ['--width']: this.size } : {}),
          ...(this.invert ? { ['--filter']: 'invert(100%)' } : {}),
          ...(this.radius === 'full' ? { ['--icon-border-radius']: '1000px' } : {}),
          ...(this.radius === 'theme' ? { ['--icon-border-radius']: 'var(--cpsl-border-radius-tile-button)' } : {}),
          ...(this.background ? { ['--icon-background']: this.background } : {}),
          ...(this.border ? { ['--icon-border']: this.border } : {}),
          ...(this.color ? { ['--icon-color']: this.color } : {}),
        }}
      >
        {this.src ? (
          <div>
            <img src={this.src} style={{ borderRadius: this.radius === 'full' ? '1000px' : undefined }} />
          </div>
        ) : (
          <div innerHTML={Icons[this.icon]} />
        )}
      </Host>
    );
  }
}
