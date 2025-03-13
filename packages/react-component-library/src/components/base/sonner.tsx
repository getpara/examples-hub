'use client';

import { appendParaPrefix } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: appendParaPrefix(
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          ),
          description: appendParaPrefix('group-[.toast]:text-muted-foreground'),
          actionButton: appendParaPrefix('group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium'),
          cancelButton: appendParaPrefix('group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium'),
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
