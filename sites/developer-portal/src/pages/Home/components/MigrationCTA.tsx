import { Link } from 'react-router-dom';
import { Button, Typography } from '@getpara/react-component-library';
import { CALENDLY_LINK } from '../../../utils/constants';
import { useGetSelectedOrganization } from '../../../hooks/api/queries/useOrganizations';
import { DismissibleCTAWrapper } from './DimissableCTAWrapper';

export const MigrationCTA = () => {
  const { data: org } = useGetSelectedOrganization();
  const hasCurrentProvider = (org?.onboardingAnswersRaw as any)?.currentProvider === 'No';

  if (!hasCurrentProvider) {
    return null;
  }

  return (
    <DismissibleCTAWrapper type="providerMigration">
      <div className="para:flex para:items-end para:gap-2 para:justify-between para:w-full para:h-full">
        <div>
          <Typography className="para:text-xl para:font-semibold">Schedule a migration call</Typography>
          <Typography color="muted" className="para:text-sm para:font-medium">
            Learn about migrating your app and existing users to Para.
          </Typography>
        </div>
        <Link to={CALENDLY_LINK} target="_blank">
          <Button variant="neutral">Schedule a Call</Button>
        </Link>
      </div>
    </DismissibleCTAWrapper>
  );
};
