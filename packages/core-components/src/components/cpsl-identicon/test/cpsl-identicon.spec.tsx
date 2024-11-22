import { newSpecPage } from '@stencil/core/testing';
import { CpslIdenticon } from '../cpsl-identicon.js';

describe('cpsl-identicon', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [CpslIdenticon],
      html: `<cpsl-identicon hash="somehash"></cpsl-identicon>`,
    });
    expect(page.root).toEqualHtml(`
      <cpsl-identicon class="blue" hash="somehash" style="width: 40px; height: 40px;">
        <mock:shadow-root>
          <svg class="rotate180" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
           <g clip-path="url(#clip0_674_66)">
             <path clip-rule="evenodd" d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" fill-rule="evenodd"></path>
           </g>
           <defs>
             <clipPath id="clip0_674_66">
               <rect height="12" width="12"></rect>
             </clipPath>
           </defs>
         </svg>
         <svg class="rotate270" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
           <g clip-path="url(#clip0_674_255)">
             <path clip-rule="evenodd" d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" fill-rule="evenodd"></path>
             <path clip-rule="evenodd" d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18ZM12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" fill-rule="evenodd"></path>
          </g>
           <defs>
             <clipPath id="clip0_674_255">
               <rect height="12" width="12"></rect>
             </clipPath>
           </defs>
         </svg>
         <svg class="rotate90" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
           <g clip-path="url(#clip0_674_66)">
             <path clip-rule="evenodd" d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" fill-rule="evenodd"></path>
           </g>
           <defs>
             <clipPath id="clip0_674_66">
               <rect height="12" width="12"></rect>
             </clipPath>
           </defs>
         </svg>
         <svg viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
           <g clip-path="url(#clip0_674_66)">
             <path clip-rule="evenodd" d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" fill-rule="evenodd"></path>
           </g>
           <defs>
             <clipPath id="clip0_674_66">
               <rect height="12" width="12"></rect>
             </clipPath>
           </defs>
         </svg>
        </mock:shadow-root>
      </cpsl-identicon>
    `);
  });
});
