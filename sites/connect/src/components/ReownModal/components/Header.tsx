import { Separator, Typography } from '@getpara/react-component-library';
import { SignClientTypes, Verify } from '@walletconnect/types';
import { CircleAlert } from 'lucide-react';
import { Avatar } from '../../Avatar';

type HeaderProps = {
  metadata: SignClientTypes.Metadata;
  intention?: string;
  verifyContext: Verify.Context;
};

export const Header = ({
  metadata: { name, icons, url },
  intention,
  verifyContext: {
    verified: { validation },
  },
}: HeaderProps) => {
  const isValid = validation === 'VALID';

  return (
    <>
      <div className="para:flex para:flex-col para:gap-4 para:items-center para:justify-center">
        <Avatar src={icons[0]} alt={name} />
        <div className="para:flex para:flex-col para:items-center para:gap-1">
          <Typography className="para:text-xl para:font-semibold para:leading-none para:text-center">{name}</Typography>
          {intention && (
            <Typography className="para:font-medium para:leading-none para:text-center" color="secondary">
              wants to {intention}
            </Typography>
          )}
          <Typography className="para:font-medium para:text-xs para:leading-none para:text-center" color="secondary">
            {url}
          </Typography>
        </div>
        {isValid && (
          <div className="para:flex para:flex-col para:items-center para:gap-0.5">
            <div className="para:flex para:gap-0.5 para:items-center">
              <CircleAlert className="para:size-3.5 para:stroke-amber-500" />
              <Typography className="para:text-sm para:font-medium para:leading-none para:text-center para:text-amber-500">
                Cannot Verify
              </Typography>
            </div>
            <Typography className="para:text-sm para:font-medium para:leading-none para:text-center para:text-amber-500">
              Please check the request carefully before approving.
            </Typography>
          </div>
        )}
      </div>
      <Separator />
    </>
  );
};
