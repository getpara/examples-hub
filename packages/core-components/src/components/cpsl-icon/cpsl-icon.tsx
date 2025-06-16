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

  render() {
    return (
      <Host
        part="icon"
        role="img"
        style={{
          ...(this.inset ? { ['--inset']: this.inset } : {}),
          ...(this.size ? { ['--height']: this.size, ['--width']: this.size } : {}),
          ...(this.invert ? { ['--filter']: 'invert(100%)' } : {}),
        }}
      >
        {!this.icon ? <img src={this.src} /> : <div innerHTML={Icons[this.icon]} />}
      </Host>
    );
  }
}
