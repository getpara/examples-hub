import { Modal } from '../Modal/Modal';
import { InlineText } from '../common';
import styled from 'styled-components';
import { GradientCTAButton } from '../GradientCTAButton/GradientCTAButton';
import { useUpgradePlan } from '../../hooks/api/mutations/useUpgradePlan';
import { triggerToast } from '../../utils/toasts';
import { ENTERPRISE_PLAN_SLUG } from '../../utils/constants';

interface RequestEnterpriseModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RequestEnterpriseModal = ({ open, onClose, onSuccess }: RequestEnterpriseModalProps) => {
  const { mutate: upgradePlan } = useUpgradePlan();
  const handleUpgradeClick = () => {
    upgradePlan(
      { newPlanSlug: ENTERPRISE_PLAN_SLUG },
      {
        onSuccess: () => {
          triggerToast({
            variant: 'success',
            title: 'Upgrade Requested!',
            body: 'We will be in touch!',
          });
          onClose();
          onSuccess?.();
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
      title="Upgrade to Enterprise"
      subtitle="Request an upgrade to enterprise. We will be in touch to confirm."
      titleColor="gradient"
    >
      <>
        <UpgradeTextContainer>
          <InlineText color="secondary">Upgrade to</InlineText> <InlineText weight="bold">Enterprise Plan</InlineText>
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
