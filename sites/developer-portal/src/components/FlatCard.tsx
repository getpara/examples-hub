import { Card, cn } from '@getpara/react-component-library';

export const FlatCard = ({ children, className, ...rest }: React.ComponentProps<'div'>) => (
  <Card className={cn('para:shadow-none para:p-8 para:rounded-lg', className)} {...rest}>
    {children}
  </Card>
);
