import { newSpecPage } from '@stencil/core/testing';
import { CpslTab } from '../cpsl-tab.js';

describe('cpsl-tab', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslTab],
      html: `<cpsl-tab></cpsl-tab>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-tab>
        <mock:shadow-root>
          <div class="tab-container">
            <slot name="start"></slot>
            <div class="content">
             <slot></slot>
            </div>
            <slot name="end"></slot>
          </div>
        </mock:shadow-root>
      </cpsl-tab>
    `);
  });
});
