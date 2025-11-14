import React from 'react';
import { Flex } from 'rebass';

import InfoPanel from '../base/InfoPanel';

import * as Styled from './styles';
import Button from '../base/Button';
import Input from '../base/Input';
import ConnectedApps from '../ConnectedApps';
import Divider from '../base/Divider';
import MyWallet from '../MyWallet';
import useIsMobile from '@/hooks/MobileContext';
import toast from 'react-hot-toast';
import { Tooltip } from '@mui/material';
import { useSelectedWallet } from '@/hooks/useSelectedWallet';
import PanelFooterText from '../PanelFooterText';
import { ParaBrand } from '@getpara/react-component-library';

interface Props {
  onDelete: (topic: string) => void;
  onConnect: (uri: string) => void;
  logout: () => void;
  setUriState: (uri: string) => void;
  uriState: string;
}

const ConnectPanel = ({ onDelete, onConnect, setUriState, logout, uriState }: Props) => {
  const { wallet } = useSelectedWallet();
  const isMobile = useIsMobile();

  const handleConnect = () => {
    if (!uriState) {
      toast.error('Please enter a valid URI');
      return;
    }
    onConnect(uriState);
  };

  return (
    <div className="para:flex-1 para:w-full para:p-4 para:flex para:items-center para:justify-center">
      <div className="para:flex para:flex-col para:gap-2 para:w-full para:max-w-[592px]">
        <InfoPanel>
          <Flex alignItems="center" flexDirection="column">
            <Flex alignItems="center" justifyContent="center">
              <ParaBrand className="para:h-9 para:w-auto" />
            </Flex>
            <Flex mt="30px">
              <Styled.SubheaderText>
                Para helps you easily onboard to and interact with the onchain apps you love. Para Portal lets you securely
                manage your Para Wallet and use it everywhere.
              </Styled.SubheaderText>
            </Flex>
            <Flex flexDirection="column" mt="30px" width="100%">
              {isMobile ? (
                <>
                  <Flex>
                    <Styled.LabelText>Connected Apps:</Styled.LabelText>
                    <Tooltip
                      enterTouchDelay={0}
                      title={
                        <Flex>
                          <Flex flexDirection="column">
                            <Styled.TooltipDescription>
                              You can take actions in these apps and come back to this page to confirm them
                            </Styled.TooltipDescription>
                          </Flex>
                        </Flex>
                      }
                    >
                      <Styled.InfoIcon />
                    </Tooltip>
                  </Flex>
                  <Flex mb="10px">
                    <Input
                      value={uriState}
                      onChange={(event: any) => setUriState(event.target.value)}
                      placeholder="eg. wc:d24a8..."
                    />
                  </Flex>
                  <Flex mb="15px">
                    <Flex alignItems="center" width="100%">
                      <Button disabled={wallet?.type === 'SOLANA'} onClick={handleConnect} isFullWidth>
                        Connect
                      </Button>
                    </Flex>
                  </Flex>
                  <Styled.FullWidthContainer>
                    <ConnectedApps onDelete={onDelete} />
                  </Styled.FullWidthContainer>
                </>
              ) : (
                <Flex alignItems="center" width="100%">
                  <Input
                    value={uriState}
                    onChange={(event: any) => setUriState(event.target.value)}
                    placeholder="eg. wc:d24a8..."
                  />
                  <Flex alignItems="center" ml="8px">
                    <Button disabled={wallet?.type === 'SOLANA'} onClick={handleConnect}>
                      Connect
                    </Button>
                  </Flex>
                </Flex>
              )}
              {!isMobile && (
                <Flex flexDirection="column" mt="15px">
                  <Flex>
                    <Styled.LabelText>Connected Apps:</Styled.LabelText>
                    <Tooltip
                      title={
                        <Flex>
                          <Flex flexDirection="column">
                            <Styled.TooltipDescription>
                              You can take actions in these apps and come back to this page to confirm them
                            </Styled.TooltipDescription>
                          </Flex>
                        </Flex>
                      }
                    >
                      <Styled.InfoIcon />
                    </Tooltip>
                  </Flex>
                  <Styled.FullWidthContainer>
                    <ConnectedApps onDelete={onDelete} />
                  </Styled.FullWidthContainer>
                </Flex>
              )}
              <Flex mt="20px" mb="15px">
                <Divider />
              </Flex>
              <div>
                <MyWallet logout={logout} />
              </div>
            </Flex>
          </Flex>
        </InfoPanel>
        <PanelFooterText />
      </div>
    </div>
  );
};

export default ConnectPanel;
