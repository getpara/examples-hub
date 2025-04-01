import clsx from 'clsx';
import { PRIVACY_POLICY, TOS } from '../../../utils/constants';
import { Button, Typography } from '@getpara/react-component-library';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const footerTextCN = 'para:text-sm para:text-muted-foreground para:font-medium';
  const linkCN = 'para:underline';

  return (
    <div className="para:mt-auto para:pt-4 para:flex para:items-center para:gap-4">
      <Typography className={footerTextCN}>© {new Date().getFullYear()} Capsule Labs, Inc.</Typography>
      <Button asChild className={clsx(footerTextCN, linkCN)} variant="link">
        <Link to={TOS} target="_blank">
          Terms and Conditions
        </Link>
      </Button>
      <Button asChild className={clsx(footerTextCN, linkCN)} variant="link">
        <Link to={PRIVACY_POLICY} target="_blank">
          Privacy Policy
        </Link>
      </Button>
    </div>
  );
};
