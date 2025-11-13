import { Avatar as BaseAvatar, AvatarFallback, AvatarImage, cn } from '@getpara/react-component-library';

type AvatarProps = {
  src: string;
  alt: string;
  className?: string;
};

export const Avatar = ({ src, alt, className }: AvatarProps) => {
  return (
    <BaseAvatar className={cn('para:rounded para:p-3 para:border para:border-border para:size-16', className)}>
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback className="para:uppercase para:bg-transparent">{alt.slice(0, 2)}</AvatarFallback>
    </BaseAvatar>
  );
};
