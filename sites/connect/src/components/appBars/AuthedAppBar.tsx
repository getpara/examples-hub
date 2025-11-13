import { Typography } from '@getpara/react-component-library';
import Link from 'next/link';

export const AuthedAppBar = () => {
  return (
    <div className="para:h-12 para:bg-background para:border-b para:border-border para:flex para:items-center para:w-full para:px-6 para:justify-between para:gap-2">
      <img src="/landingLogo.png" alt="Description" className="para:w-[186px]" />
      <div className="para:flex para:gap-6 para:items-center">
        <Link href="/">
          <Typography className="para:text-sm para:font-medium">Home</Typography>
        </Link>
        <Link href="/settings">
          <Typography className="para:text-sm para:font-medium">Settings</Typography>
        </Link>
      </div>
    </div>
  );
};
