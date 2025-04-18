import * as React from 'react';

import { cn } from '@/lib/utils';
import { LoaderCircle } from 'lucide-react';

function Loader({ className, ...props }: React.ComponentProps<'svg'>) {
  return <LoaderCircle className={cn('para:animate-spin para:stroke-primary', className)} {...props} />;
}

export { Loader };
