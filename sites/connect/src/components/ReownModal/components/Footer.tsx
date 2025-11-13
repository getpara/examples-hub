import { Button } from '@getpara/react-component-library';
import { useState } from 'react';

type ScamWarningProps = {
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
};

export const Footer = ({ onApprove, onReject }: ScamWarningProps) => {
  const [isApproveLoading, setIsApproveLoading] = useState(false);
  const [isRejectLoading, setIsRejectLoading] = useState(false);

  const handleApprove = async () => {
    setIsApproveLoading(true);
    await onApprove();
    setIsApproveLoading(false);
  };

  const handleReject = async () => {
    setIsRejectLoading(true);
    await onReject();
    setIsRejectLoading(false);
  };

  const isAnyLoading = isApproveLoading || isRejectLoading;

  return (
    <div className="para:flex para:gap-2 para:w-full">
      <Button
        className="para:flex-1"
        onClick={handleReject}
        size="lg"
        variant="secondary"
        isLoading={isRejectLoading}
        disabled={isAnyLoading}
      >
        Reject
      </Button>
      <Button
        className="para:flex-1"
        onClick={handleApprove}
        size="lg"
        variant="neutral"
        isLoading={isApproveLoading}
        disabled={isAnyLoading}
      >
        Approve
      </Button>
    </div>
  );
};
