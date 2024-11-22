import { newSpecPage } from '@stencil/core/testing';
import { CpslDrawer } from '../cpsl-drawer.js';

describe('cpsl-drawer', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslDrawer],
      html: `<cpsl-drawer></cpsl-drawer>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-drawer style="width: undefinedpx; height: 100vh; transition-duration: 0s; transition-timing-function: ease-in-out; opacity: 1; undefined: -undefinedpx;">
        <mock:shadow-root>
          <cpsl-overlay zindexoverride="10006"></cpsl-overlay>
          <div class="container" id="container" part="container">
            <slot></slot>
          </div>
        </mock:shadow-root>
      </cpsl-drawer>
    `);
  });
});
