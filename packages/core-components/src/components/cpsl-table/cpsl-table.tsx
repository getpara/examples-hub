import { Component, Host, Element, h, State } from '@stencil/core';

@Component({
  tag: 'cpsl-table',
  styleUrl: 'cpsl-table.scss',
  shadow: true,
})
export class CpslTable {
  @Element() el!: HTMLCpslTableElement;

  @State() hasHorizontalScroll: boolean = false;
  @State() hasVerticalScroll: boolean = false;

  componentDidLoad() {
    this.resizeOb.observe(this.contentContainerEl);
  }

  private resizeOb = new ResizeObserver(entries => {
    // since we are observing only a single element, so we access the first element in entries array
    const rect = entries[0].contentRect;

    // current width & height
    const containerWidth = Math.round(rect.width);
    const containerHeight = Math.round(rect.height);
    const contentWidth = this.containerSlotEl.clientWidth;
    const contentHeight = this.containerSlotEl.clientHeight;

    if (contentWidth > containerWidth) {
      this.hasHorizontalScroll = true;
    } else {
      this.hasHorizontalScroll = false;
    }
    if (contentHeight > containerHeight) {
      this.hasVerticalScroll = true;
    } else {
      this.hasVerticalScroll = false;
    }
  });

  private get containerHeaderEl() {
    return this.el.querySelector('[slot="header"]');
  }

  private get containerFooterEl() {
    return this.el.querySelector('[slot="footer"]');
  }

  private get contentContainerEl() {
    return this.el.shadowRoot.getElementById('content-container');
  }

  private get headerEl() {
    return this.el.shadowRoot.getElementById('header-container');
  }

  private get containerSlotEl() {
    return this.el.querySelector('[slot="content"]');
  }

  private get footerEl() {
    return this.el.shadowRoot.getElementById('footer-container');
  }

  render() {
    return (
      <Host>
        <cpsl-card part="table-container" style={{ position: 'relative' }}>
          <div id="header-container" class={{ 'container-header': true, 'shown': Boolean(this.containerHeaderEl) }}>
            <slot name="header"></slot>
          </div>
          <div
            id="content-container"
            class={{
              'content': true,
              'horizontal-scroll': this.hasHorizontalScroll,
              'vertical-scroll': this.hasVerticalScroll,
            }}
            part="content"
          >
            <slot name="content"></slot>
          </div>
          {this.headerEl && this.contentContainerEl && this.footerEl && (
            <div
              style={{ top: `${this.headerEl.clientHeight + 2}px`, height: `${this.contentContainerEl.clientHeight}px` }}
              class={{
                'overlay': true,
                'horizontal-scroll': this.hasHorizontalScroll,
                'vertical-scroll': this.hasVerticalScroll,
              }}
            />
          )}
          <div id="footer-container" class={{ 'container-footer': true, 'shown': Boolean(this.containerFooterEl) }}>
            <slot name="footer"></slot>
          </div>
        </cpsl-card>
      </Host>
    );
  }
}
