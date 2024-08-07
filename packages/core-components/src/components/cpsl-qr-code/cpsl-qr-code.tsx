import { Component, Host, h, Element, Prop } from '@stencil/core';
import QRCodeStyling from 'qr-code-styling';

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
  @Prop() size?: number = 250;

  componentDidLoad() {
    const container = this.el.shadowRoot.getElementById('qr-container');

    container.innerHTML = '';

    const qrCode = new QRCodeStyling({
      type: 'svg',
      data: this.url,
      image: this.imageSrc,
      height: this.size,
      width: this.size,
      qrOptions: { errorCorrectionLevel: 'L' },
      backgroundOptions: {
        color: 'transparent',
      },
      dotsOptions: {
        type: 'dots',
        color: 'currentColor',
      },
      cornersSquareOptions: { type: 'extra-rounded' },
      cornersDotOptions: { type: 'dot' },
      imageOptions: {
        crossOrigin: 'anonymous',
      },
    });

    qrCode.append(container);
  }

  render() {
    return (
      <Host>
        <div
          id="qr-container"
          class="qr-container"
          // style={{ height: `${this.size - 10 ?? 240}px`, width: `${this.size - 10 ?? 240}px` }}
        />
      </Host>
    );
  }
}
