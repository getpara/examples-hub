import { Component, Host, h, Prop, State, Element, ComponentInterface, Watch, Listen, EventEmitter, Event } from '@stencil/core';
import { Icons } from '../../assets/icons/index.js';
import { DropdownInputEventDetail } from './dropdown-interface.js';

@Component({
  tag: 'cpsl-dropdown',
  styleUrl: 'cpsl-dropdown.scss',
  shadow: true,
})
export class CpslDropdown implements ComponentInterface {
  @Element() el: HTMLCpslDropdownElement;

  /**
   * Width of the dropdown
   */
  @Prop() width: string = '100%';

  /**
   * Whether or not to include search capability
   */
  @Prop() hasCpslSearch: boolean = false;

  @State() isOpen: boolean = false;
  @State() searchQuery: string = '';
  @State() filteredItems: Array<DropdownInputEventDetail> = [];

  /**
   * Items to be presented in the dropdown
   */
  @Prop() items: Array<DropdownInputEventDetail> = [];

  /**
   * The selected item in the dropdown
   */
  @Prop({ mutable: true }) selectedItem?: DropdownInputEventDetail | null = null;

  /**
   * Event emitted when the selected item changes
   */
  @Event() selectedItemChange!: EventEmitter<DropdownInputEventDetail>;

  @Watch('selectedItem')
  handleSelectedItemChange(newValue: DropdownInputEventDetail | null) {
    if (newValue !== null) {
      this.selectItem(newValue, false);
    }
  }

  private toggleDropdown = () => {
    this.isOpen = !this.isOpen;
  };

  private selectItem = (item: DropdownInputEventDetail, emitEvent: boolean = true) => {
    this.selectedItem = item;
    this.isOpen = false;
    if (emitEvent) {
      this.selectedItemChange.emit(this.selectedItem);
    }
  };

  private handleItemSelect = (item: DropdownInputEventDetail) => () => {
    this.selectItem(item);
  };

  private handleSearchQueryChange = (event: InputEvent) => {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    this.filteredItems = this.items.filter(item => item.label.toLowerCase().includes(this.searchQuery.toLowerCase()));
  };

  @Watch('isOpen')
  handleOpenChange() {
    if (this.isOpen) {
      this.adjustPosition();
      this.addClickOutsideListener();
    } else {
      this.removeClickOutsideListener();
    }
  }

  @Listen('resize', { target: 'window' })
  handleResize() {
    if (this.isOpen) {
      this.adjustPosition();
    }
  }

  private adjustPosition() {
    const dropdownOptions = this.el.shadowRoot.querySelector('.dropdown-options') as HTMLElement;
    const parentRect = this.el.parentElement?.getBoundingClientRect();
    const searchBar = this.el.shadowRoot.querySelector('.search-bar') as HTMLElement;
    const viewportHeight = window.innerHeight;

    if (parentRect) {
      this.width = `${parentRect.width}px`;
      dropdownOptions.style.left = `${parentRect.x}px`;
      if (window.innerWidth <= 480) {
        searchBar.style.maxHeight = `30px`;
        dropdownOptions.style.top = `425px`;
        dropdownOptions.style.maxHeight = '110px';
        return;
      }
      dropdownOptions.style.top = `${parentRect.y + parentRect.height}px`;

      const availableHeight = viewportHeight - parentRect.bottom;
      dropdownOptions.style.maxHeight = `${availableHeight - 8}px`;
    }
  }

  private addClickOutsideListener() {
    window.addEventListener('click', this.handleClickOutside);
  }

  private removeClickOutsideListener() {
    window.removeEventListener('click', this.handleClickOutside);
  }

  private handleClickOutside = (event: MouseEvent) => {
    if (this.isOpen && !this.el.contains(event.target as Node)) {
      this.isOpen = false;
    }
  };

  componentWillLoad() {
    if (this.items.length > 0) {
      this.filteredItems = [...this.items];
      if (this.selectedItem !== null) {
        this.selectItem(this.selectedItem, false);
      } else {
        this.selectedItem = this.items[0];
      }
    }
  }

  disconnectedCallback() {
    this.removeClickOutsideListener();
  }

  render() {
    return (
      <Host>
        <button class="dropdown-button" onClick={this.toggleDropdown}>
          {`${this.selectedItem?.selectedLabel || this.selectedItem?.label} ${this.selectedItem?.value}`}
          <div class={`chevron ${this.isOpen ? '' : 'closed'}`} innerHTML={Icons['chevronUp']} />
        </button>
        <ul class={{ 'dropdown-options': true, 'open': this.isOpen }} style={{ width: this.width }}>
          {this.hasCpslSearch && (
            <li class="search-bar">
              <input type="text" placeholder="Search..." value={this.searchQuery} onInput={this.handleSearchQueryChange} />
            </li>
          )}
          {this.filteredItems.map(item => (
            <li onClick={this.handleItemSelect(item)}>
              <span innerHTML={Icons[item.icon]}></span>
              {item.label} <span class="dropdown-value">{item.value}</span>
            </li>
          ))}
        </ul>
      </Host>
    );
  }
}
