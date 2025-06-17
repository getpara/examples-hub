import { useParams } from 'react-router-dom';
import { useGetApiKeySetupStatus } from '../../../../../hooks/api/queries/useApiKeySetupStatus';
import { Button, cn, Typography, useFormContext } from '@getpara/react-component-library';
import { ONBOARDING_VERSION, OnboardingStep } from '../config';
import { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Environment } from '../../../../../types/environment';
import { useGetOrganizationKey } from '../../../../../hooks/api/queries/useOrganizationKeys';
import { useUpdateApiKey } from '../../../../../hooks/api/mutations/useUpdateApiKey';
import { ApiKeyOnboarding } from '../../../../../types/api';
import { SetupGuideContent } from './SetupGuideContent';
import { useGetProject } from '../../../../../hooks/api/queries/useProjects';
import { getFrameworkOnboarding } from '../../../../../utils/framework';
import { Framework } from '../../../../../types/framework';
import { SetupForm } from '../hooks/useSetupForm';

export const SetupGuide = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: status } = useGetApiKeySetupStatus(projectId ?? '', apiKey ?? '', env ?? '');
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);
  const { mutate: updateKey, isPending: isUpdatingKey } = useUpdateApiKey();
  const { data: project } = useGetProject(projectId ?? '');
  const [stepOverride, setStepOverride] = useState<number>();
  const form = useFormContext<SetupForm>();

  const framework = form.watch('framework');

  const steps = getFrameworkOnboarding((framework as Framework) ?? Framework.REACT);
  const maxSteps = steps.length - 1;
  const onboarding = apiKeyData?.onboarding;

  const { step, stepNumber } = useMemo(() => {
    const resp: { stepNumber: number; step: OnboardingStep } = {
      stepNumber: 0,
      step: steps[0],
    };

    if (stepOverride !== undefined) {
      resp.stepNumber = stepOverride;
    } else if (onboarding) {
      if (!onboarding.isComplete && !onboarding.isSkipped) {
        resp.stepNumber = onboarding.step ?? 0;

        // Reset steps when onboarding is incomplete if a different version of onboarding was introduced OR is the project framework has changed
        const shouldResetSteps =
          (onboarding.version ?? 1) !== ONBOARDING_VERSION || onboarding?.framework !== project?.framework;

        if (shouldResetSteps) {
          resp.stepNumber = 0;
        }
      }
    }

    resp.step = steps[resp.stepNumber];

    return resp;
  }, [onboarding, project?.framework, stepOverride, steps]);

  const completeDisabled = (stepNumber === 0 && !status?.firstUser) || isUpdatingKey;

  const handleCompleteStep = (isSkipped?: boolean) => () => {
    // If steps are overridden allow continuing to next step without updating the stored onboarding
    if (stepOverride !== undefined && stepOverride !== onboarding?.step) {
      setStepOverride(stepNumber + 1);
      return;
    }

    if (projectId && apiKey && env) {
      const nextStep = Math.min((onboarding?.step ?? 0) + 1, maxSteps);
      const isComplete = isSkipped || onboarding?.step === maxSteps;

      const newOnboardingObject: ApiKeyOnboarding = {
        step: nextStep,
        isComplete,
        isSkipped,
        version: ONBOARDING_VERSION,
        framework: project?.framework,
      };

      updateKey(
        {
          projectId,
          keyId: apiKey,
          env,
          data: { onboarding: newOnboardingObject },
        },
        {
          onSuccess: () => {
            setStepOverride(undefined);
          },
        },
      );
    }
  };

  const handleGoBack = () => {
    if (stepNumber > 0) {
      setStepOverride(stepNumber - 1);
    }
  };

  return (
    <>
      <div className="para:flex para:justify-between">
        {stepNumber > 0 ? (
          <Button variant="link" className="para:text-foreground para:text-xs" size="sm" onClick={handleGoBack}>
            <ArrowLeft className="para:size-4" />
            Previous Step
          </Button>
        ) : (
          <div />
        )}
        <Button variant="link" className="para:text-foreground para:text-xs" size="sm" onClick={handleCompleteStep(true)}>
          Skip
        </Button>
      </div>
      <Typography className="para:text-xl para:font-semibold">Setup Guide</Typography>
      <div>
        <Typography
          className={cn('para:text-xl para:font-semibold', {
            'para:text-amber-500': stepNumber < maxSteps,
            'para:text-green-600': stepNumber === maxSteps,
          })}
        >{`${stepNumber}/${maxSteps} Steps Completed`}</Typography>
        <Typography color="secondary" className="para:font-medium">
          {step.step}
        </Typography>
      </div>
      <div>
        <Typography className="para:font-semibold">{step.title}</Typography>
        <Typography color="muted" className="para:text-sm para:font-medium">
          {step.body}
        </Typography>
      </div>
      <SetupGuideContent step={step} />
      <div className="para:flex para:justify-end">
        <Button disabled={completeDisabled} isLoading={isUpdatingKey} size="sm" onClick={handleCompleteStep()}>
          Complete
        </Button>
      </div>
    </>
  );
};
