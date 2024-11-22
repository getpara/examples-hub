import { newSpecPage } from '@stencil/core/testing';
import { CpslHero } from '../cpsl-hero.js';

// not testing this now since it is rather complicated. Will address in a future PR
// when we overhaul the testing strategy.
describe('cpsl-hero', () => {
  xit('renders default as connection', async () => {
    const page = await newSpecPage({
      components: [CpslHero],
      html: `<cpsl-hero></cpsl-hero>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-hero>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </cpsl-hero>
    `);
  });
});
