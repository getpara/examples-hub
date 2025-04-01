'use client';

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
          toast:
            'para:group para:toast para:group-[.toaster]:bg-background para:group-[.toaster]:text-foreground para:group-[.toaster]:border-border para:group-[.toaster]:shadow-lg',
          description: 'para:group-[.toast]:text-muted-foreground',
          actionButton: 'para:group-[.toast]:bg-primary para:group-[.toast]:text-primary-foreground para:font-medium',
          cancelButton: 'para:group-[.toast]:bg-muted para:group-[.toast]:text-muted-foreground para:font-medium',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
