import { newSpecPage } from '@stencil/core/testing';
import { CpslTabs } from '../cpsl-tabs.js';

describe('cpsl-tabs', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslTabs],
      html: `<cpsl-tabs></cpsl-tabs>`,
    });
    expect(page.root).toEqualHtml(`
       <cpsl-tabs>
        <mock:shadow-root>
          <div class="tabs-container">
            <slot></slot>
            <div class="slider" style="width: -8px; left: 0px;"></div>
          </div>
        </mock:shadow-root>
      </cpsl-tabs>
    `);
  });
});
