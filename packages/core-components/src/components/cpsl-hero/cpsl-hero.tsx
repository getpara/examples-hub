import { Component, Fragment, Host, Prop, h } from '@stencil/core';
import { Images } from '../../assets/images';

@Component({
  tag: 'cpsl-hero',
  styleUrl: 'cpsl-hero.scss',
  shadow: true,
})
export class CpslHero {
  /**
   * The height of the container.
   * Default is: 180.
   */
  @Prop() height?: number;

  /**
   * Hides the fade out components
   * Default is: `false`.
   */
  @Prop() hideFadeOut?: boolean;

  /**
   * The variant of the button.
   * Options are: `"customContent"`, `"connection"`, `"externalWalletConnection"`, `"pending", `"approved",`"add", `"failed".
   * Default is: `"connection"`.
   */
  @Prop({ reflect: true }) variant?: 'customContent' | 'connection' | 'externalWalletConnection' | 'pending' | 'approved' | 'add' | 'failed' = 'connection';

  @Prop({ reflect: true }) title: string;

  @Prop({ reflect: true }) subtitle?: string;

  /**
   * Whether to use the Capsule custom theming or use the provided theme
   * Default is: `false`.
   */
  @Prop() withDefaultTheme?: boolean;

  render() {
    return (
      <Host
        class={{
          // VARIANTS
          connection: this.variant === 'connection',
          pending: this.variant === 'pending' || this.variant === 'customContent',
          approved: this.variant === 'approved',
          add: this.variant === 'add',
          failed: this.variant === 'failed',
          externalWalletConnection: this.variant === 'externalWalletConnection',
        }}
      >
        <div class="backgroundContainer" style={{ height: `${this.height ?? 180}px` }}>
          <div class={{ background: true, defaultTheme: this.withDefaultTheme }}>
            <div class="ring ring3" />
            <div class="ring ring2" />
            <div class="ring ring1" />
            <div class="ring ring0" />
            <div class={{ ringCenter: true, defaultTheme: this.withDefaultTheme }}>
              {this.variant === 'connection' && (
                <Fragment>
                  <img class="connectionImage" src={Images.heroDefault} />
                  <div class="connectDiagramContainer">
                    <slot name="connectionLeft" />
                    <slot name="connectionRight" />
                  </div>
                </Fragment>
              )}
              {this.variant === 'pending' && <img class="pendingImage" src={Images.heroPending} />}
              {this.variant === 'approved' && (
                <Fragment>
                  {!this.withDefaultTheme && <img class="approvedImage" src={Images.heroSuccess} />}
                  <cpsl-icon class="centerIcon" icon={this.withDefaultTheme ? 'heroCheckmark' : 'heroCheckmarkCapsule'} />
                </Fragment>
              )}
              {this.variant === 'add' && (
                <Fragment>
                  <cpsl-icon class="centerIcon" icon={this.withDefaultTheme ? 'heroPlusCircle' : 'heroPlusCircleCapsule'} />
                </Fragment>
              )}
              {this.variant === 'failed' && <cpsl-icon class="centerIcon" icon="heroAlertCircle" />}
              {this.variant === 'externalWalletConnection' && (
                <Fragment>
                  <cpsl-icon class="externalConnectionIcon" icon="heroExternalConnection" />
                  <div class="connectDiagramContainer">
                    <slot name="connectionLeft" />
                    <slot name="connectionRight" />
                  </div>
                </Fragment>
              )}
              {this.variant === 'customContent' && (
                <div class="customImageContainer">
                  <slot name="image" />
                </div>
              )}
            </div>
            {!this.hideFadeOut && (
              <Fragment>
                <div class="fadeOut" />
                <div class="cover" />
              </Fragment>
            )}
          </div>
        </div>
        <cpsl-text variant="headingXS" color="primary" weight="semiBold">
          {this.title}
        </cpsl-text>
        {this.subtitle && (
          <cpsl-text variant="bodyS" weight="medium" color="secondary">
            {this.subtitle}
          </cpsl-text>
        )}
      </Host>
    );
  }
}
