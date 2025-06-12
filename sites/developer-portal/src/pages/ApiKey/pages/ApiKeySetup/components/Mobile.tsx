import { ConfigCard } from '../../../components/ConfigCard';
import { AndroidSetup } from './AndroidSetup';
import { AppleSetup } from './AppleSetup';
import { SetupForm } from '../hooks/useSetupForm';
import { useFormContext } from '@getpara/react-component-library';
import { getIsFrameworkIos, getIsFrameworkAndroid } from '../../../../../utils/framework';
import { Framework } from '../../../../../types/framework';

export const Mobile = () => {
  const form = useFormContext<SetupForm>();

  const framework = form.watch('framework');

  const isIosFramework = getIsFrameworkIos(framework as Framework);
  const isAndroidFramework = getIsFrameworkAndroid(framework as Framework);

  if (isIosFramework && isAndroidFramework) {
    return null;
  }

  return (
    <ConfigCard
      title="Mobile Set Up"
      subtitle="If you are building a cross-platform app that will run on the web and on mobile you will need to supply additional, mobile specific details."
    >
      <div className="para:flex para:flex-col para:gap-4 para:flex-1">
        {!isIosFramework && <AppleSetup />}
        {!isAndroidFramework && <AndroidSetup />}
      </div>
    </ConfigCard>
  );
};
