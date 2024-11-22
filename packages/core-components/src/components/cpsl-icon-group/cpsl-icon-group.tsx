import { Component, Host, Prop, h, Element, State } from '@stencil/core';
import { IconType } from '../../interface.js';
import { Icons } from '../../assets/icons/index.js';

function isOfTypeIconType(key: string): key is IconType {
  return Object.keys(Icons).includes(key);
}

@Component({
  tag: 'cpsl-icon-group',
  styleUrl: 'cpsl-icon-group.scss',
  shadow: true,
})
export class CpslIconGroup {
  @Element() el!: HTMLCpslIconGroupElement;

  @State() isHovered: boolean;

  /**
   * The direction the icons should expand from
   */
  @Prop() expandFrom: 'left' | 'right' = 'right';

  /**
   * If `true`, the user cannot interact with the input.
   */
  @Prop() disabled = false;

  /**
   * The name of the icons to display.
   */
  @Prop() icons: (IconType | string)[];

  componentDidLoad() {
    this.el.addEventListener('mouseover', () => {
      this.isHovered = true;
    });
    this.el.addEventListener('mouseout', () => {
      this.isHovered = false;
    });
  }

  disconnectedCallback() {
    this.el.removeEventListener('mouseover', () => {
      this.isHovered = true;
    });
    this.el.removeEventListener('mouseout', () => {
      this.isHovered = false;
    });
  }

  render() {
    // If disabled remove all brand icons to ensure the disabled color is shown correctly
    const icons = this.disabled ? this.icons.map(icon => icon.replace('Brand', '')) : this.icons;

    return (
      <Host>
        {icons.map((icon, index) => {
          const isIcon = isOfTypeIconType(icon);

          return (
            <span
              part="icon-container"
              class={{
                'icon-container': true,
                'expanded': !this.disabled && this.isHovered && (this.expandFrom === 'right' ? index !== this.icons.length - 1 : index === 0),
                'disabled': this.disabled,
              }}
              style={{ zIndex: `${this.icons.length - index}` }}
            >
              <cpsl-icon key={icon} icon={isIcon ? icon : undefined} src={!isIcon ? icon : undefined} />
            </span>
          );
        })}
      </Host>
    );
  }
}
