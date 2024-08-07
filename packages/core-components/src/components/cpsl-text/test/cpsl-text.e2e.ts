import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-text', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-text></cpsl-text>');

    const element = await page.find('cpsl-text');
    expect(element).toHaveClass('hydrated');
  });
});
