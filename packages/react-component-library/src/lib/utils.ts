import { clsx, type ClassValue } from 'clsx';
import { IconNode } from 'lucide-react';
import { parseSync } from 'svgson';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function svgToLucideIconNode(svgString: string): IconNode {
  const parsed = parseSync(svgString);
  return parsed.children.map(({ name, attributes }) => [name, attributes]) as IconNode;
}
