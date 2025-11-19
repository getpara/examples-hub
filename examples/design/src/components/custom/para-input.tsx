import { Input } from '../ui/input';

export default function ParaInput({ ...props }: React.ComponentProps<typeof Input>) {
  return <Input className="para:h-[44px] para:bg-muted para:dark:bg-muted para:shadow-none" {...props} />;
}
