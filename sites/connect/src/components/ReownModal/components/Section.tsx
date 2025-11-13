import { PropsWithChildren } from 'react';
import { Label } from './Label';

type SectionProps = { label: string } & PropsWithChildren;

export const Section = ({ label, children }: SectionProps) => {
  return (
    <div className="para:flex para:flex-col para:gap-2 para:flex-1 para:w-full">
      <Label>{label}</Label>
      {children}
    </div>
  );
};
