import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { retrieve } from './library/core/transmission/transmissionUtils';
import capsule from './capsule';

export default function ShortUrl() {
  const { shortenedUrl } = useParams();
  useEffect(() => {
    async function navigate() {
      // @ts-ignore
      const message = await retrieve(shortenedUrl, capsule);
      location.href = message;
    }
    navigate();
  }, []);
  return null;
}
