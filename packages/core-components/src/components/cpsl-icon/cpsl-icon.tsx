import { Component, Host, h, Prop } from '@stencil/core';
import { IconType } from '../../interface';
import { Icons } from '../../assets/icons';

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
   * The name of the icon. If both `icon` and `src` are provided, `icon` will be used.
   */
  @Prop() icon?: IconType;

  render() {
    return (
      <Host part="icon" role="img">
        {!Boolean(this.icon) ? <img src={this.src} /> : <div innerHTML={Icons[this.icon]} />}
      </Host>
    );
  }
}
