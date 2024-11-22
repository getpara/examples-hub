import { newSpecPage } from '@stencil/core/testing';
import { CpslAppBar } from '../cpsl-app-bar.js';

describe('cpsl-app-bar', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslAppBar],
      html: `<cpsl-app-bar></cpsl-app-bar>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-app-bar style="height: undefinedpx;">
        <mock:shadow-root>
          <div class="container" part="container" style="position: fixed; height: undefinedpx;">
            <slot></slot>
          </div>
          <div style="height: undefinedpx;"></div>
        </mock:shadow-root>
      </cpsl-app-bar>
    `);
  });
});
