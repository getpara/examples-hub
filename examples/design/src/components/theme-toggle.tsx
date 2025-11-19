'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button variant="outline" size="icon" />;
  }

  return (
    <Button variant="outline" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      <Sun className="para:h-[1.2rem] para:w-[1.2rem] para:rotate-0 para:scale-100 para:transition-all para:dark:rotate-90 para:dark:scale-0" />
      <Moon className="absolute para:h-[1.2rem] para:w-[1.2rem] para:rotate-90 para:scale-0 para:transition-all para:dark:rotate-0 para:dark:scale-100" />
      <span className="para:sr-only">Toggle theme</span>
    </Button>
  );
}
