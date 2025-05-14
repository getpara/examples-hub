import { CpslButton, CpslText } from '@getpara/react-components';
import { Modal } from '../../../components/Modal/Modal';
import { useUpgradeSubscription } from '../../../hooks/api/mutations/useUpgradeSubscription';
import { usePlanMetadata } from '../../../hooks/configs/usePlanMetadata';
import { toast } from '@getpara/react-component-library';

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
          toast.success('Subscription Updated!');
        },
        onError: () => {
          toast.error('Failed to Upgrade Subscription', {
            description: 'Please try again. If the problem persists, contact Para support.',
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
