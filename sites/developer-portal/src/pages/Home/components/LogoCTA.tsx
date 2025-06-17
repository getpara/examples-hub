import { Typography } from '@getpara/react-component-library';
import { useGetSelectedOrganization } from '../../../hooks/api/queries/useOrganizations';
import { DismissibleCTAWrapper } from './DimissableCTAWrapper';
import { useUploadLogo } from '../hooks/useUploadLogo';
import { UploadButton } from '../../../components/UploadButton';
import { useOrganizationMemberCapabilities } from '../../../hooks/api/queries/useOrganizationMember';

export const LogoCTA = () => {
  const { data: org } = useGetSelectedOrganization();
  const { uploadLogo, isUploadingLogo } = useUploadLogo();
  const { data: capabilities } = useOrganizationMemberCapabilities();

  if (org?.logoUrl || !capabilities?.canUpdateOrganization) {
    return null;
  }

  const handleUpload = (file?: File | null) => {
    if (!file || !org) {
      return;
    }

    uploadLogo(org.id, file);
  };

  return (
    <DismissibleCTAWrapper type="logo">
      <div className="para:flex para:items-center para:gap-2 para:justify-between para:w-full para:h-full">
        <div>
          <Typography className="para:text-xl para:font-semibold">Give {org?.name} a logo</Typography>
          <Typography color="muted" className="para:text-sm para:font-medium">
            Upload a logo to represent your organization.
          </Typography>
        </div>
        <div className="para:flex para:flex-col para:md:flex-row para:gap-2 para:items-center para:mr-10">
          <div className="para:flex para:flex-col para:gap-1">
            <Typography className="para:font-medium">Logo</Typography>
            <Typography color="muted" className="para:text-xs para:font-medium">
              Size: 80px x 80px
            </Typography>
          </div>
          <UploadButton
            idPrefix="logoUrl"
            onInputChange={ev => {
              handleUpload(ev.target?.files?.[0]);
            }}
            isLoading={isUploadingLogo}
            buttonClassName="para:w-[80px]"
            value={org?.logoUrl}
          />
        </div>
      </div>
    </DismissibleCTAWrapper>
  );
};
