import { Component, Host, h, Prop } from '@stencil/core';
import { IconType } from '../../interface.js';

@Component({
  tag: 'cpsl-tile-button',
  styleUrl: 'cpsl-tile-button.scss',
  shadow: true,
})
export class CpslTileButton {
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
      <Host>
        <button class="button-native">
          <cpsl-icon exportparts="icon" src={this.src} icon={this.icon} />
          <slot></slot>
        </button>
      </Host>
    );
  }
}
