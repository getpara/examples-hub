import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { retrieve } from './library/core/transmission/transmissionUtils';
import capsule from './capsule';

export default function ShortUrl() {
  const { shortenedUrl } = useParams();
  useEffect(() => {
    async function navigate() {
      const message = await retrieve(shortenedUrl!, capsule.ctx.capsuleClient);
      location.href = message;
    }
    navigate();
  }, []);
  return null;
}
