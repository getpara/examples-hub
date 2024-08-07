import { newSpecPage } from '@stencil/core/testing';
import { CpslOverlay } from '../cpsl-overlay';

describe('cpsl-overlay', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslOverlay],
      html: `<cpsl-overlay></cpsl-overlay>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-overlay>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </cpsl-overlay>
    `);
  });
});
