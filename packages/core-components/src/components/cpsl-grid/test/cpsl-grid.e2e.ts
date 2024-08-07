import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-grid', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-grid></cpsl-grid>');

    const element = await page.find('cpsl-grid');
    expect(element).toHaveClass('hydrated');
  });
});
