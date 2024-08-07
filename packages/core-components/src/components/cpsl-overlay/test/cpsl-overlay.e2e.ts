import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-overlay', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-overlay></cpsl-overlay>');

    const element = await page.find('cpsl-overlay');
    expect(element).toHaveClass('hydrated');
  });
});
