import { Separator } from '../ui/separator';

export default function OrDivider() {
  return (
    <div className="para:flex para:items-center para:justify-center para:gap-4">
      <Separator className="para:flex-1" />
      <p className="para:text-[10px] para:text-muted-foreground">OR</p>
      <Separator className="para:flex-1" />
    </div>
  );
}
