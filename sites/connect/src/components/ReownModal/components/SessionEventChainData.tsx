import { useSnapshot } from 'valtio';
import ModalStore from '../../../store/ModalStore';
import { SessionTypes, SignClientTypes } from '@walletconnect/types';
import { Chains } from './Chains';
import { RelayProtocol } from './RelayProtocol';
import { Separator } from '@getpara/react-component-library';

type SessionEventChainDataProps = { isForChainSwitch?: boolean };

export const SessionEventChainData = ({ isForChainSwitch }: SessionEventChainDataProps) => {
  const { data } = useSnapshot(ModalStore.state);

  const event = data?.requestEvent as SignClientTypes.EventArguments['session_request'];
  const session = data?.requestSession as SessionTypes.Struct;

  if (!event || !session) return null;

  const chainId = isForChainSwitch
    ? (event.params.request.params as Array<{ chainId: string }>)[0].chainId
    : event.params.chainId;

  return (
    <>
      <div className="para:flex para:items-center para:gap-2 para:justify-between">
        <Chains chainIds={[chainId]} />
        <RelayProtocol protocol={session.relay.protocol} />
      </div>
      <Separator />
    </>
  );
};
