import { newSpecPage } from '@stencil/core/testing';
import { CpslPopover } from '../cpsl-popover.js';

describe('cpsl-popover', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslPopover],
      html: `<cpsl-popover></cpsl-popover>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-popover class="transform-h-left transform-v-top" style="top: undefinedpx; left: undefinedpx; width: 0px;">
        <mock:shadow-root>
          <div class="container" id="container">
            <slot></slot>
          </div>
        </mock:shadow-root>
      </cpsl-popover>
    `);
  });
});
