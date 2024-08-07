import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-tabs', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-tabs></cpsl-tabs>');

    const element = await page.find('cpsl-tabs');
    expect(element).toHaveClass('hydrated');
  });
});
