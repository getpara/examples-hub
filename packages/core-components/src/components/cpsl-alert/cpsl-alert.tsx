import { Component, Host, Prop, h } from '@stencil/core';
import { IconType } from '../../interface';

@Component({
  tag: 'cpsl-alert',
  styleUrl: 'cpsl-alert.scss',
  shadow: true,
})
export class CpslAlert {
  /**
   * The name of the icon to show.
   */
  @Prop() icon?: IconType;

  /**
   * Hides the icon.
   */
  @Prop() noIcon?: boolean;

  /**
   * The variant of alert.
   * Options are: `"error"` | `"warning"` | `"success"` | `"custom"`
   * Default is: `"error"`.
   */
  @Prop() variant?: 'error' | 'warning' | 'success' | 'custom' = 'error';

  /**
   * Whether to show the alert with a filled background based on the variant
   */
  @Prop() filled?: boolean;

  private get iconType(): IconType | undefined {
    if (this.icon) {
      return this.icon;
    }

    switch (this.variant) {
      case 'custom': {
        return undefined;
      }
      case 'success': {
        return 'checkCircle';
      }
      case 'warning': {
        return 'alertCircle';
      }
      case 'error':
      default: {
        return 'alertCircle';
      }
    }
  }

  render() {
    return (
      <Host class={{ error: this.variant === 'error', warning: this.variant === 'warning', success: this.variant === 'success', filled: this.filled }}>
        <div class="alert-container">
          <div class="title-container">
            {!this.noIcon && this.iconType && <cpsl-icon icon={this.iconType} />}
            <slot></slot>
          </div>
          <slot name="subtitle"></slot>
        </div>
      </Host>
    );
  }
}
