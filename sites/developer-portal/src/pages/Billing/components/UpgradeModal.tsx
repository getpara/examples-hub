import { CpslButton, CpslText } from '@usecapsule/react-components';
import { Modal } from '../../../components/Modal/Modal';
import { triggerToast } from '../../../utils/toasts';
import { useUpgradeSubscription } from '../../../hooks/api/mutations/useUpgradeSubscription';
import { usePlanMetadata } from '../../../hooks/configs/usePlanMetadata';

interface UpgradeModalProps {
  open: boolean;
  planSlug: string;
  onClose: () => void;
}

export const UpgradeModal = ({ open, planSlug, onClose }: UpgradeModalProps) => {
  const { mutateAsync: upgradeSub, isPending } = useUpgradeSubscription();
  const { planMeta } = usePlanMetadata();

  const planName = planMeta.find(p => p.slug === planSlug)?.name;

  const handleUpgradeClick = () => {
    upgradeSub(
      { planSlug },
      {
        onSettled: () => {
          onClose();
          triggerToast({
            variant: 'success',
            title: 'Subscription Updated!',
          });
        },
        onError: () => {
          triggerToast({
            variant: 'error',
            title: 'Failed to Upgrade Subscription',
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
      title={`Upgrade to ${planName}`}
      subtitle={`Are you sure you want to upgrade to ${planName} tier?`}
    >
      <>
        <CpslText color="secondary">{`Your new billing and usage rates will begin immediately.`}</CpslText>
        <CpslButton fullWidth onClick={handleUpgradeClick} disabled={isPending}>
          Confirm
        </CpslButton>
      </>
    </Modal>
  );
};
