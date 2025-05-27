import { Button, Typography } from '@getpara/react-component-library';
import { useTranslation } from 'react-i18next';
import { FlatCard } from '../../../components/common';
import { PlanSlug, SUPPORT_URL } from '../../../utils/constants';
import { useBillingStore } from '../store/useBillingStore';
import { Link } from 'react-router-dom';

export const FooterCard = () => {
  const openChangeModal = useBillingStore(state => state.openChangeModal);
  const { t } = useTranslation(['billing', 'error']);

  const handleDowngradeClick = () => {
    openChangeModal(PlanSlug.FREE);
  };

  return (
    <FlatCard className="para:md:flex-row">
      <Typography className="para:font-medium para:flex-1 para:whitespace-pre-line">{t('footer.title')}</Typography>
      <div className="para:flex para:gap-2 para:sm:flex-row para:flex-col">
        <div>
          <Link to={SUPPORT_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="neutral" className="para:w-full para:sm:w-auto">
              {t('footer.buttons.contact')}
            </Button>
          </Link>
        </div>
        <div>
          <Button variant="secondary" className="para:w-full para:sm:w-auto" onClick={handleDowngradeClick}>
            {t('footer.buttons.downgrade')}
          </Button>
        </div>
      </div>
    </FlatCard>
  );
};
