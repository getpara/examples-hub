import { newSpecPage } from '@stencil/core/testing';
import { CpslSelectItem } from '../cpsl-select-item.js';

describe('cpsl-select-item', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslSelectItem],
      html: `<cpsl-select-item></cpsl-select-item>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-select-item>
        <mock:shadow-root>
          <div class="outer-container" part="outer-container">
            <div class="inner-container" part="inner-container">
              <slot></slot>
            </div>
          </div>
        </mock:shadow-root>
      </cpsl-select-item>
    `);
  });
});
