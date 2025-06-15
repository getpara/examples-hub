import { Component, Host, Prop, h } from '@stencil/core';

const TEXT_EL_PART = 'text-element';

@Component({
  tag: 'cpsl-text',
  styleUrl: 'cpsl-text.scss',
  shadow: true,
})
export class CpslText {
  /**
   * The color of text.
   * Options are: `"primary"`, `"secondary", `"tertiary", `"subtle", `"inverted", `"error".
   * Default is: `"primary"`.
   */
  @Prop() color?: 'primary' | 'secondary' | 'tertiary' | 'subtle' | 'inverted' | 'error' | 'contrast' | 'success' = 'primary';

  /**
   * The variant of text.
   * Options are: `"body2XS"`, `"bodyXS", `"bodyS", `"bodyM", `"bodyL", `"bodyXL", `"headingXS", `"headingS", `"headingM", `"headingL", `"headingXL", `"heading2XL".
   * Default is: `"bodyM"`.
   */
  @Prop() variant?: 'body2XS' | 'bodyXS' | 'bodyS' | 'bodyM' | 'bodyL' | 'bodyXL' | 'headingXS' | 'headingS' | 'headingM' | 'headingL' | 'headingXL' | 'heading2XL' = 'bodyM';

  /**
   * The weight of text.
   * Options are: `"regular"`, `"medium", `"semiBold", `"bold".
   * Default is: `"regular"`.
   */
  @Prop() weight?: 'regular' | 'medium' | 'semiBold' | 'bold' = 'regular';

  private getContent = () => {
    switch (this.variant) {
      case 'headingXS': {
        return (
          <h6 part={TEXT_EL_PART}>
            <slot></slot>
          </h6>
        );
      }
      case 'headingS': {
        return (
          <h5 part={TEXT_EL_PART}>
            <slot></slot>
          </h5>
        );
      }
      case 'headingM': {
        return (
          <h4 part={TEXT_EL_PART}>
            <slot></slot>
          </h4>
        );
      }
      case 'headingL': {
        return (
          <h3 part={TEXT_EL_PART}>
            <slot></slot>
          </h3>
        );
      }
      case 'headingXL': {
        return (
          <h2 part={TEXT_EL_PART}>
            <slot></slot>
          </h2>
        );
      }
      case 'heading2XL': {
        return (
          <h1 part={TEXT_EL_PART}>
            <slot></slot>
          </h1>
        );
      }
      default: {
        return (
          <p part={TEXT_EL_PART}>
            <slot></slot>
          </p>
        );
      }
    }
  };

  render() {
    return (
      <Host
        class={{
          // COLORS
          'primary': this.color === 'primary',
          'secondary': this.color === 'secondary',
          'tertiary': this.color === 'tertiary',
          'subtle': this.color === 'subtle',
          'inverted': this.color === 'inverted',
          'error': this.color === 'error',
          'contrast': this.color === 'contrast',
          'success': this.color === 'success',
          // WEIGHTS
          'medium': this.weight === 'medium',
          'semi-bold': this.weight === 'semiBold',
          'bold': this.weight === 'bold',
          // SIZES
          'body-2xs': this.variant === 'body2XS',
          'body-xs': this.variant === 'bodyXS',
          'body-s': this.variant === 'bodyS',
          'body-m': this.variant === 'bodyM',
          'body-l': this.variant === 'bodyL',
          'body-xl': this.variant === 'bodyXL',
          'heading-xs': this.variant === 'headingXS',
          'heading-s': this.variant === 'headingS',
          'heading-m': this.variant === 'headingM',
          'heading-l': this.variant === 'headingL',
          'heading-xl': this.variant === 'headingXL',
          'heading-2xl': this.variant === 'heading2XL',
        }}
      >
        {this.getContent()}
      </Host>
    );
  }
}
