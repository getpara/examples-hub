import { triggerToast } from '../../utils/toasts';
import { useCreateProject } from '../../hooks/api/mutations/useCreateProject';
import { Framework } from '../../types/framework';
import { ENV_VARS, FRAMEWORK_OPTIONS, IS_BETA, IS_PROD, PACKAGE_MANAGER_OPTIONS } from '../../utils/constants';
import { formatFrameworkName, frameworkHasPackageManager } from '../../utils/framework';
import { formatPackageManagerName } from '../../utils/packageManager';
import { HTTPS_URL_REGEX } from '../../utils/regex';
import { useCreateApiKey } from '../../hooks/api/mutations/useCreateApiKey';
import { Environment } from '../../types/environment';
import { useCanCreateProject } from '../../hooks/subscriptionGating/useCanCreateProject';
import { AxiosError } from 'axios';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SubmitHandler,
  useForm,
  useWatch,
} from '@getpara/react-component-library';

interface CreateProjectModalProps {
  open: boolean;
  setIsOpen: (_: boolean) => void;
}

const DEFAULT_VALUES = {
  name: '',
  framework: '',
  packageManager: '',
  homepageUrl: '',
};

export const CreateProjectModal = ({ open, setIsOpen }: CreateProjectModalProps) => {
  const { canCreateProject } = useCanCreateProject();
  const { mutateAsync: createProject } = useCreateProject();
  const { mutateAsync: createApiKey } = useCreateApiKey();

  const form = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: DEFAULT_VALUES,
  });
  const [framework] = useWatch({
    control: form.control,
    name: ['framework'],
  });

  const onSubmit: SubmitHandler<{
    name: string;
    framework: string;
    packageManager: string;
    homepageUrl: string;
  }> = async ({ name, framework, packageManager, homepageUrl }) => {
    if (canCreateProject) {
      try {
        const newProject = await createProject(
          {
            data: { name, framework, packageManager },
          },
          {
            onError: err => {
              let body = 'Please try again. If the problem persists, contact Para support.';

              if ((err as AxiosError).response?.data === 'max projects created for the current plan') {
                body =
                  "You've reached the max number of projects allowed on your current plan level. Upgrade to add more projects.";
              }

              triggerToast({
                variant: 'error',
                title: 'Failed to Create Project',
                body,
              });
            },
          },
        );

        if (newProject) {
          await createApiKey(
            {
              projectId: newProject.project.id,
              env: IS_PROD ? Environment.BETA : IS_BETA ? Environment.SANDBOX : (ENV_VARS.environment as Environment),
              data: { homepageUrl },
            },
            {
              onError: () => {
                triggerToast({
                  variant: 'error',
                  title: 'Failed to Create Key',
                  body: 'Please try again. If the problem persists, contact Para support.',
                });
              },
            },
          );
        }
        triggerToast({
          variant: 'success',
          title: 'Project Created!',
        });
      } finally {
        setIsOpen(false);
      }
    }
  };

  if (!canCreateProject) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={open => {
        if (!open) {
          form.reset(DEFAULT_VALUES);
        }

        setIsOpen(open);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="para:flex para:flex-col para:gap-4">
            <DialogHeader>
              <DialogTitle className="para:text-left para:text-foreground">New Project</DialogTitle>
              <DialogDescription className="para:text-left">Give your new project a name</DialogDescription>
            </DialogHeader>
            <div className="para:flex para:flex-col para:gap-2">
              <FormField
                control={form.control}
                name="name"
                rules={{
                  required: 'Project name is required',
                }}
                render={({ field: { ref: _, ...restField } }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl className="para:mt-2 para:mb-1">
                      <Input placeholder="Enter Name" {...restField} />
                    </FormControl>
                    <FormMessage className="para:text-xs para:text-destructive" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="framework"
                render={({ field: { ref: ref, ...restField } }) => (
                  <FormItem>
                    <FormLabel>Framework</FormLabel>
                    <Select {...restField}>
                      <FormControl className="para:mt-2 para:mb-1">
                        <SelectTrigger className="para:w-full">
                          <SelectValue placeholder="Select Framework" ref={ref} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FRAMEWORK_OPTIONS.map(o => (
                          <SelectItem key={o} value={o}>
                            {formatFrameworkName(o)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="para:text-xs para:text-destructive" />
                  </FormItem>
                )}
              />
              {frameworkHasPackageManager[(framework as Framework) ?? Framework.REACT] && (
                <FormField
                  control={form.control}
                  name="packageManager"
                  render={({ field: { ref: ref, ...restField } }) => (
                    <FormItem>
                      <FormLabel>Package Manager</FormLabel>
                      <Select {...restField}>
                        <FormControl className="para:mt-2 para:mb-1">
                          <SelectTrigger className="para:w-full">
                            <SelectValue placeholder="Select Package Manager" ref={ref} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PACKAGE_MANAGER_OPTIONS.map(o => (
                            <SelectItem key={o} value={o}>
                              {formatPackageManagerName(o)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="para:text-xs para:text-destructive" />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="homepageUrl"
                rules={{
                  required: 'Website URL is required',
                  pattern: {
                    value: HTTPS_URL_REGEX,
                    message: 'Must be a secure (https) url',
                  },
                }}
                render={({ field: { ref: _, ...restField } }) => (
                  <FormItem>
                    <FormLabel>Website URL</FormLabel>
                    <FormControl className="para:mt-2 para:mb-1">
                      <Input placeholder="https://www.yourwebsite.com" {...restField} />
                    </FormControl>
                    <FormMessage className="para:text-xs para:text-destructive" />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
