import { Button, Typography } from '@getpara/react-component-library';
import { CircleAlert } from 'lucide-react';

type ScamWarningProps = {
  onProceed: () => void;
  onReject: () => void;
  isMismatch?: boolean;
};

export const ScamWarning = ({ onProceed, onReject, isMismatch }: ScamWarningProps) => {
  return (
    <div className="para:flex para:flex-col para:gap-4 para:items-center para:justify-center">
      <div className="para:flex para:gap-1 para:items-center">
        <CircleAlert className="para:size-4.5 para:stroke-destructive" />
        <Typography className="para:text-xl para:font-medium para:leading-none para:text-center para:text-destructive">
          Potential Scam Detected
        </Typography>
      </div>
      <Typography className="para:text-sm para:font-medium para:text-center">
        {isMismatch
          ? 'This website has a domain that does not match the sender of this request.'
          : 'This website you`re trying to connect is flagged as malicious by multiple security providers.'}
        <br />
        Approving may lead to loss of funds.
      </Typography>
      <div className="para:flex para:gap-2 para:w-full">
        <Button className="para:flex-1" onClick={onReject} size="lg" variant="secondary">
          Reject
        </Button>
        <Button className="para:flex-1" onClick={onProceed} size="lg" variant="destructive">
          Proceed Anyway
        </Button>
      </div>
    </div>
  );
};
