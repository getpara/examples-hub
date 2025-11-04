import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const isProd = process.env.NEXT_PUBLIC_ENV === 'PROD';

  res.setHeader('Content-Type', 'application/xml');

  if (isProd) {
    // Production: Serve full sitemap
    res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://connect.getpara.com</loc>
    <priority>1.0</priority>
    <changefreq>weekly</changefreq>
  </url>
</urlset>`);
  } else {
    // Non-production: Return empty sitemap
    res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- No URLs for non-production environment -->
</urlset>`);
  }
}
