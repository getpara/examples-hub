import { newSpecPage } from '@stencil/core/testing';
import { CpslPill } from '../cpsl-pill';

describe('cpsl-pill', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslPill],
      html: `<cpsl-pill></cpsl-pill>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-pill>
        <mock:shadow-root>
          <div class="pill-container">
            <span></span>
          </div>
        </mock:shadow-root>
      </cpsl-pill>
    `);
  });
});
