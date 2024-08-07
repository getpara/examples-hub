import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-animation', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-animation></cpsl-animation>');

    const element = await page.find('cpsl-animation');
    expect(element).toHaveClass('hydrated');
  });
});
