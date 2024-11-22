import { newSpecPage } from '@stencil/core/testing';
import { CpslPagination } from '../cpsl-pagination.js';

describe('cpsl-pagination', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslPagination],
      html: `<cpsl-pagination></cpsl-pagination>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-pagination>
        <mock:shadow-root>
          <cpsl-button-group selectedid="0">
            <cpsl-button class="arrow-button">
              <cpsl-icon class="icon start-icon" icon="arrowNarrow"></cpsl-icon>
            </cpsl-button>
            <cpsl-button class="arrow-button">
              <cpsl-icon class="icon" icon="arrowNarrow"></cpsl-icon>
            </cpsl-button>
          </cpsl-button-group>
        </mock:shadow-root>
      </cpsl-pagination>
    `);
  });
});
