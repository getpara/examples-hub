'use client';

import React, { useEffect, useState } from 'react';
import { web3wallet } from '@/utils/WalletConnectUtil';
import { getSdkError } from '@walletconnect/utils';
import { Flex } from 'rebass';

import ConnectPanel from '@/components/ConnectPanel';
import BottomNav from '@/components/BottomNav';
import InstructionPanel from '@/components/InstructionPanel';

import * as Styled from '../styles/home';
import { ParaProtoSigner } from '@getpara/cosmjs-v0-integration';
import { useAccount, useLogout, useClient } from '@getpara/react-sdk';
import SettingsStore from '@/store/SettingsStore';
import toast from 'react-hot-toast';
import useIsMobile from '@/hooks/MobileContext';
import PanelFooterText from '@/components/PanelFooterText';
import { useSelectedWallet } from '@/hooks/useSelectedWallet';

const HomePage = () => {
  const { isConnected } = useAccount();
  const { logoutAsync } = useLogout();
  const { wallet } = useSelectedWallet();
  const para = useClient();
  const [uriState, setUriState] = useState('');
  const [instructionPanelOpenState, setInstructionPanelOpenState] = useState(false);
  const [pairings, setPairings] = useState(web3wallet.core.pairing.getPairings().filter(pair => pair.peerMetadata));
  const isMobile = useIsMobile();

  const onConnect = async (uri: string) => {
    try {
      await web3wallet.pair({ uri });
    } catch (error) {
      console.error(error);
      toast.error(`could not connect App: ${error}`);
    } finally {
      const interval = setInterval(async () => {
        const currentPairings = web3wallet.core.pairing.getPairings();
        if (currentPairings.length !== pairings.length && currentPairings[currentPairings.length - 1]?.active) {
          const newPairings = currentPairings.filter(pairing => pairing.peerMetadata?.name);
          setPairings(newPairings);
          setUriState('');
          clearInterval(interval);
        }
      }, 2000);
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
        for (const pairing of pairings) {
          try {
            await web3wallet.disconnectSession({
              topic: pairing.topic,
              reason: getSdkError('USER_DISCONNECTED'),
            });
          } catch (error) {
            console.error(error);
          }
        }
        await logout();
        setPairings([]);
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

    for (const pairing of pairings) {
      try {
        await web3wallet.disconnectSession({
          topic: pairing.topic,
          reason: getSdkError('USER_DISCONNECTED'),
        });
      } catch (error) {
        console.error(error);
      }
    }

    setPairings([]);
  };

  const removePairing = async (topic: string) => {
    let newPairings;
    try {
      await web3wallet.disconnectSession({
        topic,
        reason: getSdkError('USER_DISCONNECTED'),
      });
    } catch (error) {
      console.error(error);
    } finally {
      newPairings = pairings.filter(pairing => pairing.topic !== topic);
      setPairings(newPairings);
    }
  };

  return (
    <Styled.Container>
      <Flex
        flexDirection="column"
        alignItems="center"
        mt={isMobile ? '50px' : '125px'}
        mb="150px"
        style={{ minHeight: isMobile ? '70vh' : 0 }}
      >
        <ConnectPanel
          logout={logout}
          pairings={pairings}
          onDelete={removePairing}
          onConnect={onConnect}
          uriState={uriState}
          setUriState={setUriState}
        />
        {isConnected && <PanelFooterText />}
      </Flex>
      <BottomNav
        instructionPanelOpenState={instructionPanelOpenState}
        handleOpenDrawer={() => setInstructionPanelOpenState(true)}
      />
      <InstructionPanel
        instructionPanelOpenState={instructionPanelOpenState}
        setInstructionPanelOpenState={setInstructionPanelOpenState}
      />
    </Styled.Container>
  );
};

export default HomePage;
