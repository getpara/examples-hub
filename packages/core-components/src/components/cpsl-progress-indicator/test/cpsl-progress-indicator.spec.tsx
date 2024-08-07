import { newSpecPage } from '@stencil/core/testing';
import { CpslProgressIndicator } from '../cpsl-progress-indicator';

describe('cpsl-progress-indicator', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslProgressIndicator],
      html: `<cpsl-progress-indicator></cpsl-progress-indicator>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-progress-indicator>
        <mock:shadow-root>
          <div class="step"></div>
        </mock:shadow-root>
      </cpsl-progress-indicator>
    `);
  });
});
