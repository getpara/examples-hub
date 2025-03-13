import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const appendParaPrefix = (className: string) =>
  className
    .split(' ')
    .map(cn => (cn.startsWith('para:') ? cn : `para:${cn}`))
    .join(' ');
