import { newSpecPage } from '@stencil/core/testing';
import { CpslCodeInput } from '../cpsl-code-input';

describe('cpsl-code-input', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslCodeInput],
      html: `<cpsl-code-input></cpsl-code-input>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-code-input>
        <mock:shadow-root>
          <div class="code-container">
            <input class="code-input" id="code-input-0" inputmode="numeric" max="9" maxlength="1" min="0">
          </div>
        </mock:shadow-root>
      </cpsl-code-input>
    `);
  });
});
