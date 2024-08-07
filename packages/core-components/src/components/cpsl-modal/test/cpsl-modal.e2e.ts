import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-modal', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-modal></cpsl-modal>');

    const element = await page.find('cpsl-modal');
    expect(element).toHaveClass('hydrated');
  });
});
