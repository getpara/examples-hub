import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-divider', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-divider></cpsl-divider>');

    const element = await page.find('cpsl-divider');
    expect(element).toHaveClass('hydrated');
  });
});
