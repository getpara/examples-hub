import ModalStore from '../../../store/ModalStore';
import { useSnapshot } from 'valtio';
import { SignClientTypes } from '@walletconnect/types';
import { getSignParamsMessage } from '../../../utils/HelperUtil';
import { Message } from './Message';

export const SessionEventMessage = () => {
  const { data } = useSnapshot(ModalStore.state);

  const event = data?.requestEvent as SignClientTypes.EventArguments['session_request'];

  if (!event) return null;

  const message = getSignParamsMessage(event.params.request.params);

  return <Message message={message} />;
};
