import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { transmissionUtilsRetrieve } from '@usecapsule/web-sdk';
import capsule from '../../clients/capsule';

export default function ShortUrl() {
  const { shortenedUrl } = useParams();
  useEffect(() => {
    async function navigate() {
      const message = await transmissionUtilsRetrieve(
        shortenedUrl!,
        capsule.ctx.capsuleClient,
      );
      location.href = message;
    }

    navigate();
  }, []);
  return null;
}
