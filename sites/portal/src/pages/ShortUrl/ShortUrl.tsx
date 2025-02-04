import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { transmissionUtilsRetrieve } from '@getpara/web-sdk';
import { usePara } from '../../components/ParaContext';

export default function ShortUrl() {
  const para = usePara();
  const { shortenedUrl } = useParams();
  useEffect(() => {
    async function navigate() {
      const message = await transmissionUtilsRetrieve(shortenedUrl!, para.ctx.client);
      location.href = message;
    }

    navigate();
  }, []);
  return null;
}
