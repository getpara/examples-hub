import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ThemedCard({
  title,
  description,
  children,
  variant = 'default',
  className,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'muted';
  className?: string;
}) {
  const variantClasses = {
    default: 'para:bg-card para:text-card-foreground',
    accent: 'para:bg-accent para:text-accent-foreground',
    muted: 'para:bg-muted para:text-muted-foreground',
  };

  return (
    <Card className={cn(variantClasses[variant], className)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
}
