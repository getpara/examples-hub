import { Component, Host, h, Element, Prop } from '@stencil/core';
import QrCodeWithLogo from 'qrcode-with-logos';
import { IconType } from '../../interface.js';
import { Icons } from '../../assets/icons/index.js';

@Component({
  tag: 'cpsl-qr-code',
  styleUrl: 'cpsl-qr-code.scss',
  shadow: true,
})
export class CpslQrCode {
  @Element() el!: HTMLCpslQrCodeElement;

  /**
   * URL for the QR code to link to.
   */
  @Prop() url: string;

  /**
   * Source for the center image of the QR code.
   */
  @Prop() imageSrc?: string;

  /**
   * Size of the QR code in pixels.
   * Default is 250.
   */
  @Prop() size?: number = 286;

  /**
   * The name of the icon. If both `icon` and `src` are provided, `icon` will be used.
   */
  @Prop() icon?: IconType;

  componentDidLoad() {
    const imageSrc = this.icon && typeof window !== undefined ? `data:image/svg+xml;base64,${window?.btoa(Icons[this.icon])}` : this.imageSrc;

    new QrCodeWithLogo({
      content: this.url,
      width: 1000,
      image: this.imgEl,
      logo: imageSrc
        ? {
            src: imageSrc,
            borderRadius: 16,
            borderWidth: -20,
          }
        : '',
      dotsOptions: {
        type: 'dot',
      },
      cornersOptions: {
        type: 'rounded',
        radius: {
          inner: 8,
          outer: 32,
        },
      },
      nodeQrCodeOptions: {
        margin: 0,
        errorCorrectionLevel: 'H',
      },
    });
  }

  private get imgEl(): HTMLImageElement {
    return this.el.shadowRoot.getElementById('qr-code') as HTMLImageElement;
  }

  render() {
    return (
      <Host>
        <div id="qr-container" class="qr-container" style={{ width: `${this.size}px`, height: `${this.size}px` }}>
          <img id="qr-code" class="qr-code" />
        </div>
      </Host>
    );
  }
}
