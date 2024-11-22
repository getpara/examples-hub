import { newSpecPage } from '@stencil/core/testing';
import { CpslTileButton } from '../cpsl-tile-button.js';

describe('cpsl-tile-button', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslTileButton],
      html: `<cpsl-tile-button></cpsl-tile-button>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-tile-button>
        <mock:shadow-root>
          <button class="button-native">
            <cpsl-icon exportparts="icon"></cpsl-icon>
            <slot></slot>
          </button>
        </mock:shadow-root>
      </cpsl-tile-button>
    `);
  });
});
