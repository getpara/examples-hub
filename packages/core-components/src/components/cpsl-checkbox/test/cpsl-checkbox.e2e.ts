import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-checkbox', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-checkbox></cpsl-checkbox>');

    const element = await page.find('cpsl-checkbox');
    expect(element).toHaveClass('hydrated');
  });
});
