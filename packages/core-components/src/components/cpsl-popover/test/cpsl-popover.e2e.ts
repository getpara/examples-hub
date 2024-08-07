import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-popover', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-popover></cpsl-popover>');

    const element = await page.find('cpsl-popover');
    expect(element).toHaveClass('hydrated');
  });
});
