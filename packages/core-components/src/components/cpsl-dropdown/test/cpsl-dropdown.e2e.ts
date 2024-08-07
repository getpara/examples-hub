import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-dropdown', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-dropdown></cpsl-dropdown>');

    const element = await page.find('cpsl-dropdown');
    expect(element).toHaveClass('hydrated');
  });
});
