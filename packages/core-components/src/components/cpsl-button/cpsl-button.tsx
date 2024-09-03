import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'cpsl-button',
  styleUrl: 'cpsl-button.scss',
  shadow: true,
})
export class CpslButton {
  /**
   * The tag for the button.
   * Options are: `"button"`, `"a".
   * Default is: `"button"`.
   */
  @Prop() as?: 'button' | 'a' = 'button';

  /**
   * If the button is disabled.
   * Default is: false.
   */
  @Prop({ reflect: true }) disabled?: boolean = false;

  /**
   * Whether the button takes the full width of it's container.
   * Default is: false.
   */
  @Prop() fullWidth?: boolean = false;

  /**
   * href to use when using a link.
   */
  @Prop() href?: string;

  /**
   * The size of the button.
   * Options are: `"small"`, `"medium".
   * Default is: `"medium"`.
   */
  @Prop() size?: 'small' | 'medium' = 'medium';

  /**
   * target to use when using a link.
   */
  @Prop() target?: string;

  /**
   * The variant of the button.
   * Options are: `"primary"`, `"secondary", `"tertiary", `"ghost"`, `"destructive"`.
   * Default is: `"primary"`.
   */
  @Prop({ reflect: true }) variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'destructive' = 'primary';

  render() {
    return (
      <Host
        class={{
          // VARIANTS
          'primary': this.variant === 'primary',
          'secondary': this.variant === 'secondary',
          'tertiary': this.variant === 'tertiary',
          'ghost': this.variant === 'ghost',
          'destructive': this.variant === 'destructive',
          // STATE
          'disabled': this.disabled,
          'full-width': this.fullWidth,
          // SIZES
          'small': this.size === 'small',
          'medium': this.size === 'medium',
        }}
      >
        <this.as href={this.href} target={this.target} part="button-native" class="button-native">
          <slot name="start"></slot>
          <slot></slot>
          <slot name="end"></slot>
        </this.as>
      </Host>
    );
  }
}
