import { ConfigCard } from '../../../components/ConfigCard';
import { AssetUpload } from './AssetUpload';

export const Logos = () => {
  return (
    <ConfigCard title="Logos">
      <div className="para:flex para:flex-col para:md:flex-row para:gap-4">
        <AssetUpload formKey={'iconUrl'} />
        <AssetUpload formKey={'logoUrl'} />
      </div>
    </ConfigCard>
  );
};
