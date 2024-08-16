import { Component, Host, Prop, h } from '@stencil/core';
import { Images } from '../../assets/images';

const Checkmark = () => (
  <svg width="48" height="35" viewBox="0 0 48 35" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M47.219 1.11439C48.2604 2.15579 48.2604 3.84423 47.219 4.88563L17.8856 34.219C16.8442 35.2604 15.1558 35.2604 14.1144 34.219L0.781049 20.8856C-0.26035 19.8442 -0.26035 18.1558 0.781049 17.1144C1.82245 16.073 3.51089 16.073 4.55229 17.1144L16 28.5621L43.4477 1.11439C44.4891 0.0729939 46.1776 0.0729939 47.219 1.11439Z"
      fill="url(#paint0_linear_841_278)"
    />
    <defs>
      <linearGradient id="paint0_linear_841_278" x1="48" y1="17.6667" x2="0" y2="17.6667" gradientUnits="userSpaceOnUse">
        <stop stop-color="#BC82F3" />
        <stop offset="0.485" stop-color="#FF6778" />
        <stop offset="1" stop-color="#FFBA71" />
      </linearGradient>
    </defs>
  </svg>
);

const AlertCircle = () => (
  <svg width="58" height="58" viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M29 18.3333V29M29 39.6666H29.0267M55.6667 29C55.6667 43.7276 43.7276 55.6666 29 55.6666C14.2724 55.6666 2.33333 43.7276 2.33333 29C2.33333 14.2724 14.2724 2.33331 29 2.33331C43.7276 2.33331 55.6667 14.2724 55.6667 29Z"
      stroke="#F04438"
      stroke-width="4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

@Component({
  tag: 'cpsl-hero',
  styleUrl: 'cpsl-hero.scss',
  shadow: true,
})
export class CpslHero {
  /**
   * The variant of the button.
   * Options are: `"default"`, `"loading", `"success".
   * Default is: `"default"`.
   */
  @Prop({ reflect: true }) variant?: 'connection' | 'pending' | 'approved' | 'failed' = 'connection';

  @Prop({ reflect: true }) title: string;

  @Prop({ reflect: true }) subtitle?: string;

  render() {
    return (
      <Host
        class={{
          // VARIANTS
          connection: this.variant === 'connection',
          pending: this.variant === 'pending',
          approved: this.variant === 'approved',
          failed: this.variant === 'failed',
        }}
      >
        <div class="backgroundContainer">
          <div class="background">
            <div class="ring ring3" />
            <div class="ring ring2" />
            <div class="ring ring1" />
            <div class="ring ring0" />
            {this.variant === 'connection' && (
              <div class={`ringCenter connection`}>
                <img src={Images.heroDefault} />
              </div>
            )}
            {this.variant === 'pending' && (
              <div class={`ringCenter pending`}>
                <img src={Images.heroPending} />
              </div>
            )}

            {this.variant === 'approved' && (
              <div class={`ringCenter approved`}>
                <img src={Images.heroSuccess} />
              </div>
            )}
            <div class="fadeOut" />
          </div>
          <div class="children">
            {this.variant === 'connection' && (
              <div class="connectDiagramContainer">
                <slot name="connectionLeft" />
                <slot name="connectionRight" />
              </div>
            )}
            {this.variant === 'failed' && AlertCircle()}
            {this.variant === 'approved' && Checkmark()}
          </div>
        </div>
        <cpsl-text variant="headingXS" color="primary" weight="medium">
          {this.title}
        </cpsl-text>
        {this.subtitle && (
          <cpsl-text variant="bodyM" color="secondary">
            {this.subtitle}
          </cpsl-text>
        )}
      </Host>
    );
  }
}
