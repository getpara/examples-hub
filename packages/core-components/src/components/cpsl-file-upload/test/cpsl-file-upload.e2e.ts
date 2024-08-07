import { newE2EPage } from '@stencil/core/testing';

describe('cpsl-file-upload', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<cpsl-file-upload></cpsl-file-upload>');

    const element = await page.find('cpsl-file-upload');
    expect(element).toHaveClass('hydrated');
  });
});
