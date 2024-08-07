import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-radio', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-radio></cpsl-radio>');

    const element = await page.find('cpsl-radio');
    expect(element).toHaveClass('hydrated');
  });
});
