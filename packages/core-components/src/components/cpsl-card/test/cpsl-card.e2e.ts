import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-card', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-card></cpsl-card>');

    const element = await page.find('cpsl-card');
    expect(element).toHaveClass('hydrated');
  });
});
