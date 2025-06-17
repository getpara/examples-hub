import { ConfigCard } from '../../../components/ConfigCard';
import { AndroidSetup } from './AndroidSetup';
import { AppleSetup } from './AppleSetup';
import { SetupForm } from '../hooks/useSetupForm';
import { Button, useFormContext } from '@getpara/react-component-library';
import { getIsFrameworkIos, getIsFrameworkAndroid } from '../../../../../utils/framework';
import { Framework } from '../../../../../types/framework';
import { useGetOrganizationSubscription } from '../../../../../hooks/api/queries/useOrganizationSubscription';
import { Link, useParams } from 'react-router-dom';
import { Environment } from '../../../../../types/environment';

export const Mobile = () => {
  const { organizationId, env } = useParams();
  const { data: subscription } = useGetOrganizationSubscription();
  const form = useFormContext<SetupForm>();

  const hideNativePasskeyAccess = env?.toUpperCase() === Environment.PROD && !subscription?.plan?.canUseNativePasskeys;

  const framework = form.watch('framework');

  const isIosFramework = getIsFrameworkIos(framework as Framework);
  const isAndroidFramework = getIsFrameworkAndroid(framework as Framework);

  if (isIosFramework && isAndroidFramework) {
    return null;
  }

  return (
    <ConfigCard
      id="mobile-setup"
      title="Mobile Set Up"
      subtitle="If you are building a cross-platform app that will run on the web and on mobile you will need to supply additional, mobile specific details."
    >
      {hideNativePasskeyAccess ? (
        <Link to={`/${organizationId}/billing`}>
          <Button>Upgrade Plan</Button>
        </Link>
      ) : (
        <div className="para:flex para:flex-col para:gap-4 para:flex-1">
          {!isIosFramework && <AppleSetup />}
          {!isAndroidFramework && <AndroidSetup />}
        </div>
      )}
    </ConfigCard>
  );
};
