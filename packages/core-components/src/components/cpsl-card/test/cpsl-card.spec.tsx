import { newSpecPage } from '@stencil/core/testing';
import { CpslCard } from '../cpsl-card';

describe('cpsl-card', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslCard],
      html: `<cpsl-card></cpsl-card>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-card>
        <mock:shadow-root>
          <div class="card" part="card-container">
            <slot></slot>
          </div>
        </mock:shadow-root>
      </cpsl-card>
    `);
  });
});
