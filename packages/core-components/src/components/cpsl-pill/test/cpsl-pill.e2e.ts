import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-pill', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-pill></cpsl-pill>');

    const element = await page.find('cpsl-pill');
    expect(element).toHaveClass('hydrated');
  });
});
