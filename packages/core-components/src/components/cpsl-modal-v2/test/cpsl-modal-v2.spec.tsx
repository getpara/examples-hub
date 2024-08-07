import { newSpecPage } from '@stencil/core/testing';
import { CpslModalV2 } from '../cpsl-modal-v2';

describe('cpsl-modal-v2', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslModalV2],
      html: `<cpsl-modal-v2></cpsl-modal-v2>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-modal-v2>
        <mock:shadow-root>
          <cpsl-overlay entertransitionduration="0.15" exittransitionduration="0.15" id="overlay"></cpsl-overlay>
          <cpsl-card class="card" style="transition-duration: 0.15s;">
            <slot></slot>
          </cpsl-card>
        </mock:shadow-root>
      </cpsl-modal-v2>
    `);
  });
});
