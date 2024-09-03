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
   * The variant of alert.
   * Options are: `"error"` | `"warning"` | `"success"` | `"custom"`
   * Default is: `"error"`.
   */
  @Prop() variant?: 'error' | 'warning' | 'success' | 'custom' = 'error';

  private get iconType(): IconType | undefined {
    if (this.icon) {
      this.icon;
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
      <Host class={{ error: this.variant === 'error', warning: this.variant === 'warning', success: this.variant === 'success' }}>
        <div class="alert-container">
          {this.iconType && <cpsl-icon icon={this.iconType} />}
          <slot></slot>
        </div>
      </Host>
    );
  }
}
