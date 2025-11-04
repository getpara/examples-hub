import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const isProd = process.env.NEXT_PUBLIC_ENV === 'PROD';

  res.setHeader('Content-Type', 'text/plain');

  if (isProd) {
    // Production: Allow crawling
    res.status(200).send(`User-agent: *
Allow: /

Sitemap: https://connect.getpara.com/sitemap.xml`);
  } else {
    // Non-production: Block all crawling
    res.status(200).send(`User-agent: *
Disallow: /

# This is a non-production environment
# Please visit https://connect.getpara.com for the production site`);
  }
}
