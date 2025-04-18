import { Button, Typography, useFormContext } from '@getpara/react-component-library';
import { ConfigCard } from '../../../components/ConfigCard';
import { SquareArrowOutUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SetupForm } from '../../../hooks/useSetupForm';
import {
  formatFrameworkName,
  getFrameworkCodeSnippet,
  getFrameworkDocsLink,
  getFrameworkExtraSetupLink,
  getFrameworkPackages,
} from '../../../../../utils/framework';
import { Framework } from '../../../../../types/framework';
import { getPackageManagerInstallString } from '../../../../../utils/packageManager';
import { PackageManager } from '../../../../../types/packageManager';
import { CopyInput } from '../../../../../components/CopyInput';
import { CodeBlock } from '../../../../../components/CodeBlock/CodeBlock';

export const Install = () => {
  const form = useFormContext<SetupForm>();

  const [framework, packageManager] = form.watch(['framework', 'packageManager']);

  const typedFramework = (framework as Framework) ?? Framework.REACT;
  const typedPackageManager = (packageManager as PackageManager) ?? PackageManager.NPM;

  const installString = `${getPackageManagerInstallString(typedPackageManager)} ${getFrameworkPackages(typedFramework)}`;
  const codeSnippet = getFrameworkCodeSnippet(typedFramework);
  const extraSetupLink = getFrameworkExtraSetupLink(typedFramework);

  return (
    <ConfigCard
      title="Install"
      ActionComponent={
        <Link to={getFrameworkDocsLink(typedFramework)}>
          <Button variant="outline">
            Install Guide <SquareArrowOutUpRight />
          </Button>
        </Link>
      }
    >
      <div className="para:flex-1 para:flex para:flex-col para:gap-4">
        <div className="para:flex para:flex-col para:gap-2">
          <Typography className="para:text-sm para:font-medium">Install Package</Typography>
          <CopyInput
            value={installString}
            disabled
            inputClassName="para:disabled:opacity-100 para:disabled:pointer-events-auto para:disabled:cursor-text"
          />
        </div>
        {codeSnippet && (
          <div className="para:flex para:flex-col para:gap-2">
            <div className="para:flex para:flex-col para:gap-1">
              <Typography className="para:text-sm para:font-semibold">Copy and Paste Code Snippet</Typography>
              <Typography color="secondary" className="para:text-sm para:font-medium">
                After you add this code, run your project to confirm that it is working correctly.
              </Typography>
            </div>
            <CodeBlock snippet={codeSnippet} />
          </div>
        )}
        {extraSetupLink && (
          <Link to={extraSetupLink} target="_blank">
            <Button variant="outline">
              {formatFrameworkName(typedFramework)} requires extra setup. Follow our guide here <SquareArrowOutUpRight />
            </Button>
          </Link>
        )}
      </div>
    </ConfigCard>
  );
};
