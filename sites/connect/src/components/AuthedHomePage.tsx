'use client';

import React, { useEffect, useState } from 'react';
import { walletKit } from '@/utils/WalletConnectUtil';
import { getSdkError } from '@walletconnect/utils';

import ConnectPanel from '@/components/ConnectPanel';
import BottomNav from '@/components/BottomNav';
import InstructionPanel from '@/components/InstructionPanel';

import { ParaProtoSigner } from '@getpara/cosmjs-v0-integration';
import { useAccount, useLogout, useClient } from '@getpara/react-sdk';
import SettingsStore from '@/store/SettingsStore';
import toast from 'react-hot-toast';
import { useSelectedWallet } from '@/hooks/useSelectedWallet';
import { useDisconnectSessions } from '../hooks/useDisconnectSession';

export const AuthedHomePage = () => {
  const { isConnected } = useAccount();
  const { logoutAsync } = useLogout();
  const { wallet } = useSelectedWallet();
  const para = useClient();
  const [uriState, setUriState] = useState('');
  const [instructionPanelOpenState, setInstructionPanelOpenState] = useState(false);
  const { mutateAsync: disconnectSessions } = useDisconnectSessions();

  const onConnect = async (uri: string) => {
    try {
      await walletKit.pair({ uri });
    } catch (error) {
      console.error(error);
      toast.error(`Could not connect App: ${error}`);
    } finally {
      setUriState('');
    }
  };

  useEffect(() => {
    const loadCapsuleModule = async () => {
      if (!para) return;

      let cosmosDirectSigner: ParaProtoSigner | undefined = undefined;
      if (isConnected && wallet?.type) {
        if (wallet.type === 'COSMOS') {
          cosmosDirectSigner = new ParaProtoSigner(para, undefined, wallet?.id);
        }
      }

      const params = new URLSearchParams(window.location.search);
      const uriParam = params.get('uri');

      if (uriParam) {
        if (isConnected) {
          await onConnect(decodeURIComponent(uriParam));
        }
      }

      if (!(await para.isFullyLoggedIn())) {
        for (const session of Object.values(walletKit.getActiveSessions())) {
          try {
            await walletKit.disconnectSession({
              topic: session.topic,
              reason: getSdkError('USER_DISCONNECTED'),
            });
          } catch (error) {
            console.error(error);
          }
        }
        await logout();
        return;
      }

      const walletId = wallet?.id || para.findWalletId();
      const newAddress = para.getDisplayAddress(walletId);
      SettingsStore.setCapsuleAddress(newAddress as string);
      if (cosmosDirectSigner && newAddress) {
        SettingsStore.setCosmosAddress(cosmosDirectSigner.address);
      }
    };

    loadCapsuleModule();
  }, [isConnected, wallet?.id, para]);

  const logout = async () => {
    await logoutAsync();

    await disconnectSessions(Object.values(walletKit.getActiveSessions()).map(session => session.topic));
  };

  const removeSession = async (topic: string) => {
    await disconnectSessions([topic]);
  };

  return (
    <div className="para:flex para:flex-col para:items-center para:flex-1">
      <ConnectPanel
        logout={logout}
        onDelete={removeSession}
        onConnect={onConnect}
        uriState={uriState}
        setUriState={setUriState}
      />
      <BottomNav
        instructionPanelOpenState={instructionPanelOpenState}
        handleOpenDrawer={() => setInstructionPanelOpenState(true)}
      />
      <InstructionPanel
        instructionPanelOpenState={instructionPanelOpenState}
        setInstructionPanelOpenState={setInstructionPanelOpenState}
      />
    </div>
  );
};
