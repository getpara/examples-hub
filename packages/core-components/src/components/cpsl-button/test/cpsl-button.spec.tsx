import { newSpecPage } from '@stencil/core/testing';
import { CpslButton } from '../cpsl-button';

describe('cpsl-button', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslButton],
      html: `<cpsl-button></cpsl-button>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-button class="medium primary" variant="primary">
        <mock:shadow-root>
          <button class="button-native" part="button-native">
            <slot name="start"></slot>
            <slot></slot>
            <slot name="end"></slot>
          </button>
        </mock:shadow-root>
      </cpsl-button>
    `);
  });
});
