'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Modal' },
    { href: '/portal', label: 'Portal' },
    { href: '/animation-test', label: 'Animation Test' },
  ];

  return (
    <nav className="para:flex para:justify-between para:items-center para:p-4 para:w-full para:bg-secondary para:border-b">
      <div className="para:flex para:gap-6 para:items-center">
        <h1 className="para:font-bold para:text-lg">My App</h1>
        <ul className="para:flex para:gap-4">
          {links.map(link => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  'para:text-sm para:font-medium para:transition-colors para:hover:text-primary',
                  pathname === link.href ? 'para:text-foreground' : 'para:text-muted-foreground',
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
