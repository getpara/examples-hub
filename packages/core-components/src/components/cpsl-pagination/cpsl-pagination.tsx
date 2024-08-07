import { Component, Host, Prop, State, Event, h, EventEmitter, Watch } from '@stencil/core';

@Component({
  tag: 'cpsl-pagination',
  styleUrl: 'cpsl-pagination.scss',
  shadow: true,
})
export class CpslPagination {
  @State() currentPage = 0;

  /**
   * The initial page to select.
   * Default is 0.
   */
  @Prop() initialPage?: number;

  /**
   * The total number of pages.
   */
  @Prop() totalPages: number;

  /**
   * The number of pages visible to select.
   * Default is 5.
   * Min is 5.
   */

  @Prop({ mutable: true }) visiblePages?: number = 5;

  /**
   * Emitted when exit animation finishes.
   */
  @Event() cpslPaginationChanged!: EventEmitter<number>;

  @Watch('currentPage')
  watchChange() {
    this.cpslPaginationChanged.emit(this.currentPage);
  }

  componentWillLoad() {
    this.currentPage = this.initialPage ?? 0;
    if (this.visiblePages < 5) {
      this.visiblePages = 5;
    }
  }

  private handlePrevClick = () => {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  };

  private handleNextClick = () => {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
    }
  };

  private handlePageClick = (value: number) => () => {
    if (value >= 0 && value <= this.totalPages - 1) {
      this.currentPage = value;
    }
  };

  render() {
    const filteredPages: number[] = this.totalPages <= this.visiblePages ? [...Array(this.totalPages).keys()] : [];

    if (this.totalPages > this.visiblePages) {
      filteredPages.push(0);

      const isFirstSelected = this.currentPage === 0;
      const isLastSelected = this.currentPage === this.totalPages - 1;
      const isFirstOrLastSelected = isFirstSelected || isLastSelected;

      let remainingVisible = this.visiblePages - (isFirstOrLastSelected ? 2 : 3);
      const halfRemaining = Math.round(remainingVisible / 2);
      const numberBefore = Math.max(this.currentPage - 1, 0);
      const numberAfter = Math.max(this.totalPages - 2 - this.currentPage, 0);
      let beforeHalf = halfRemaining;
      let afterHalf = remainingVisible - halfRemaining;

      if (numberBefore >= beforeHalf) {
        if (numberAfter < afterHalf) {
          beforeHalf += afterHalf - numberAfter;
          afterHalf = numberAfter;
        }
      } else {
        afterHalf += beforeHalf - numberBefore;
        beforeHalf = numberBefore;
      }

      while (beforeHalf > 0) {
        filteredPages.push(this.currentPage - beforeHalf);
        beforeHalf--;
      }

      if (!isFirstSelected) {
        filteredPages.push(this.currentPage);
      }

      const pagesAfter: number[] = [];
      while (afterHalf > 0) {
        pagesAfter.push(this.currentPage + afterHalf);
        afterHalf--;
      }

      filteredPages.push(...pagesAfter.reverse());

      if (!isLastSelected) {
        filteredPages.push(this.totalPages - 1);
      }
    }

    return (
      <Host>
        <cpsl-button-group selectedId={`${this.currentPage}`}>
          <cpsl-button class="arrow-button" onClick={this.handlePrevClick}>
            <cpsl-icon class={{ 'icon': true, 'start-icon': true }} icon="arrowNarrow" />
          </cpsl-button>
          {filteredPages.map(page => (
            <cpsl-button key={page} variant="secondary" fullWidth id={`${page}`} onClick={this.handlePageClick(page)}>
              <cpsl-text variant="bodyS">{page + 1}</cpsl-text>
            </cpsl-button>
          ))}
          <cpsl-button class="arrow-button" onClick={this.handleNextClick}>
            <cpsl-icon class="icon" icon="arrowNarrow" />
          </cpsl-button>
        </cpsl-button-group>
      </Host>
    );
  }
}
