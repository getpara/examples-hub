import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-modal-v2', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-modal-v2></cpsl-modal-v2>');

    const element = await page.find('cpsl-modal-v2');
    expect(element).toHaveClass('hydrated');
  });
});
