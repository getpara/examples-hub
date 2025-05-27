import { PRIVACY_POLICY, TOS } from '../../../utils/constants';
import { Button, cn, Typography } from '@getpara/react-component-library';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const footerTextCN = 'para:text-sm para:text-muted-foreground para:font-medium';
  const linkCN = 'para:underline para:p-0';

  return (
    <div className="para:mt-auto para:pt-4 para:flex para:items-center para:gap-4">
      <Typography className={footerTextCN}>© {new Date().getFullYear()} Capsule Labs, Inc.</Typography>
      <Link to={TOS} target="_blank">
        <Button className={cn(footerTextCN, linkCN)} variant="link">
          Terms and Conditions
        </Button>
      </Link>
      <Link to={PRIVACY_POLICY} target="_blank">
        <Button className={cn(footerTextCN, linkCN)} variant="link">
          Privacy Policy
        </Button>
      </Link>
    </div>
  );
};
