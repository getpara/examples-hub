import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-icon', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-icon></cpsl-icon>');

    const element = await page.find('cpsl-icon');
    expect(element).toHaveClass('hydrated');
  });
});
