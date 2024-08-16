import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-hero', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-hero></cpsl-hero>');

    const element = await page.find('cpsl-hero');
    expect(element).toHaveClass('hydrated');
  });
});
