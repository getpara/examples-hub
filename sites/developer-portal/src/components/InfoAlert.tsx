import { Alert, AlertDescription, AlertTitle } from '@getpara/react-component-library';
import { Info } from 'lucide-react';
import { ReactNode } from 'react';

type InfoAlertProps = {
  className?: string;
  title: string;
  content: ReactNode;
};

export const InfoAlert = ({ className, title, content }: InfoAlertProps) => {
  return (
    <Alert className={className}>
      <Info className="para:stroke-magnetica-600" />
      <AlertTitle className="para:text-magnetica-600">{title}</AlertTitle>
      <AlertDescription>{content}</AlertDescription>
    </Alert>
  );
};
