import { Component, EventEmitter, Host, Prop, h, Event, Element } from '@stencil/core';

@Component({
  tag: 'cpsl-nav-button',
  styleUrl: 'cpsl-nav-button.scss',
  shadow: true,
})
export class CpslNavButton {
  @Element() el!: HTMLCpslNavButtonElement;

  /**
   * If the button is disabled.
   * Default is: false.
   */
  @Prop({ reflect: true }) disabled?: boolean = false;

  /**
   * Whether or not to use exact matching for the selected main route.
   */
  @Prop() exactMainRouteMatch?: boolean;

  /**
   * Whether or not to use exact matching for the selected sub route.
   */
  @Prop() exactSubRouteMatch?: boolean;

  /**
   * The route for the button.
   */
  @Prop() route: string;

  /**
   * The id of the selected button.
   */
  @Prop() subRoutes?: { label: string; value: string }[];

  /**
   * Path used to determine what button is selected
   */
  @Prop() path?: string;

  /**
   * Called when the nav button is clicked.
   */
  @Event() cpslNavButtonClick: EventEmitter<string>;

  private handleNavButtonClick = () => {
    this.cpslNavButtonClick.emit(this.route);
  };

  /**
   * Called when a nav button sub route is clicked.
   */
  @Event() cpslNavButtonSubRouteClick: EventEmitter<string>;

  private handleSubRouteClick = (route: string) => () => {
    this.cpslNavButtonSubRouteClick.emit(route);
  };

  render() {
    const selectedSubRoute = this.subRoutes?.find(sr => (this.exactSubRouteMatch ? this.path === `${this.route}/${sr.value}` : this.path.includes(`${this.route}/${sr.value}`)));
    const isMainRouteSelected = this.exactMainRouteMatch ? this.path === this.route : this.path.includes(this.route);

    return (
      <Host>
        <cpsl-button
          id={this.route}
          class={{ 'main-route': true, 'selected': !!selectedSubRoute || isMainRouteSelected }}
          fullWidth
          variant="primary"
          disabled={this.disabled}
          onClick={this.handleNavButtonClick}
        >
          <slot name="start"></slot>
          <slot></slot>
          <slot name="end"></slot>
        </cpsl-button>
        {(!!selectedSubRoute || isMainRouteSelected) && !!this.subRoutes?.length && (
          <div class="sub-route-container">
            {this.subRoutes.map(sr => (
              <cpsl-button
                key={sr.value}
                id={`${this.route}/${sr.value}`}
                class={{ 'sub-route': true, 'selected': sr.value === selectedSubRoute?.value }}
                onClick={this.handleSubRouteClick(`${this.route}/${sr.value}`)}
                fullWidth
                variant="primary"
              >
                {sr.label}
              </cpsl-button>
            ))}
          </div>
        )}
      </Host>
    );
  }
}
