import { Avatar, AvatarFallback, AvatarImage, cn } from '@getpara/react-component-library';

type OrganizationAvatarProps = {
  className?: string;
  url?: string;
  name: string;
};

export const OrganizationAvatar = ({ className, url, name }: OrganizationAvatarProps) => {
  return (
    <Avatar className={cn('para:size-10 para:border-border para:border para:rounded-md para:p-1', className)}>
      <AvatarImage src={url} alt={name} />
      <AvatarFallback>{name.slice(0, 1).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
};
