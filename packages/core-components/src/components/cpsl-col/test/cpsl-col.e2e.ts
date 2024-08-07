import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-col', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-col></cpsl-col>');

    const element = await page.find('cpsl-col');
    expect(element).toHaveClass('hydrated');
  });
});
