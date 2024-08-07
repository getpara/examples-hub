import { newSpecPage } from '@stencil/core/testing';
import { CpslAvatar } from '../cpsl-avatar';

describe('cpsl-avatar', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslAvatar],
      html: `<cpsl-avatar></cpsl-avatar>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-avatar>
        <mock:shadow-root>
          <span>
            <img alt="avatar">
          </span>
        </mock:shadow-root>
      </cpsl-avatar>
    `);
  });
});
