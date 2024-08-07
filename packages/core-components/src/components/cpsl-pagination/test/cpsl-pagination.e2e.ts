import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-pagination', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-pagination></cpsl-pagination>');

    const element = await page.find('cpsl-pagination');
    expect(element).toHaveClass('hydrated');
  });
});
