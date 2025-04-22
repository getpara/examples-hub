import { ConfigCard } from '../../../components/ConfigCard';
import { AssetUpload } from './AssetUpload';

export const Logos = () => {
  return (
    <ConfigCard title="Logos">
      <>
        <AssetUpload formKey={'iconUrl'} />
        <AssetUpload formKey={'logoUrl'} />
      </>
    </ConfigCard>
  );
};
