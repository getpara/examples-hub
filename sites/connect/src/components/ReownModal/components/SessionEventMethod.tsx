import ModalStore from '../../../store/ModalStore';
import { useSnapshot } from 'valtio';
import { SignClientTypes } from '@walletconnect/types';
import { Methods } from './Methods';

export const SessionEventMethod = () => {
  const { data } = useSnapshot(ModalStore.state);

  const event = data?.requestEvent as SignClientTypes.EventArguments['session_request'];

  if (!event) return null;

  return <Methods methods={[event.params.request.method]} />;
};
