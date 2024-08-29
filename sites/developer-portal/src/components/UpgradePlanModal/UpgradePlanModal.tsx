import { Modal } from '../Modal/Modal';
import { InlineText } from '../common';
import styled from 'styled-components';
import { GradientCTAButton } from '../GradientCTAButton/GradientCTAButton';
import { useUpgradePlan } from '../../hooks/api/mutations/useUpgradePlan';
import { triggerToast } from '../../utils/toasts';

interface UpgradePlanModalProps {
  open: boolean;
  planName: string;
  planSlug: string;
  onClose: () => void;
  onExited: () => void;
}

export const UpgradePlanModal = ({ open, planName, planSlug, onClose, onExited }: UpgradePlanModalProps) => {
  const { mutate: upgradePlan } = useUpgradePlan();
  const handleUpgradeClick = () => {
    upgradePlan(
      { newPlanSlug: planSlug },
      {
        onSuccess: () => {
          triggerToast({
            variant: 'success',
            title: 'Upgrade Requested!',
            body: 'We will be in touch!',
          });
          onClose();
        },
        onError: () => {
          triggerToast({
            variant: 'error',
            title: 'Error Requesting Upgrade',
            body: 'Please try again. If the problem persists, contact Capsule support.',
          });
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      onExited={onExited}
      title="Upgrade Plan"
      subtitle="Request an upgrade to your plan. We will be in touch via email to confirm."
      titleColor="gradient"
    >
      <>
        <UpgradeTextContainer>
          <InlineText color="secondary">Upgrade to</InlineText> <InlineText weight="bold">{planName} Plan</InlineText>
        </UpgradeTextContainer>
        <GradientCTAButton fullWidth onClick={handleUpgradeClick}>
          Upgrade
        </GradientCTAButton>
      </>
    </Modal>
  );
};

const UpgradeTextContainer = styled.span`
  margin-top: -12px;
`;
