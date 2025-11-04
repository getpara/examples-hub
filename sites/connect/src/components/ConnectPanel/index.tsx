import React from 'react';
import { Flex } from 'rebass';

import InfoPanel from '../base/InfoPanel';

import * as Styled from './styles';
import Button from '../base/Button';
import Input from '../base/Input';
import ConnectedApps from '../ConnectedApps';
import Divider from '../base/Divider';
import MyWallet from '../MyWallet';
import ConnectButton from '../ConnectButton';
import useIsMobile from '@/hooks/MobileContext';
import PanelFooterText from '../PanelFooterText';
import toast from 'react-hot-toast';
import { Tooltip } from '@mui/material';
import { useAccount } from '@getpara/react-sdk';
import { useSelectedWallet } from '@/hooks/useSelectedWallet';

interface Props {
  pairings: any;
  onDelete: (topic: string) => void;
  onConnect: (uri: string) => void;
  logout: () => void;
  setUriState: (uri: string) => void;
  uriState: string;
}

const ParaHeader = () => {
  return (
    <svg height="38" viewBox="0 0 843 207" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M60 0H144C183.764 0 216 32.2355 216 72C216 111.765 183.764 144 144 144H96C82.7452 144 72 154.745 72 168V204H0V132H36C49.2548 132 60 121.255 60 108L60 0Z"
        fill="#121212"
      />
      <path
        d="M319.68 203.8H288V19H381.72C419.472 19 442.44 44.08 442.44 77.08C442.44 114.304 416.568 137.008 381.72 137.008H319.68V203.8ZM319.68 47.512V108.496H380.136C399.936 108.496 410.232 93.712 410.232 77.08C410.232 59.656 398.352 47.512 380.136 47.512H319.68Z"
        fill="#121212"
      />
      <path
        d="M500.768 206.048C468.56 206.048 447.44 190.472 447.704 164.336C447.968 131.6 480.44 124.736 507.632 121.568C528.752 119.192 544.328 118.4 544.592 107.312C544.328 93.584 533.768 84.608 515.816 84.608C497.336 84.608 484.136 94.64 482.288 109.16H450.872C453.776 79.592 480.176 59 516.344 59C554.096 59 574.952 79.592 574.952 109.424V172.784C574.952 176.744 577.064 178.856 581.816 178.856H589.472V203.144H574.688C560.432 203.144 551.72 197.336 549.344 186.776C548.816 185.456 548.288 183.608 548.024 182.024C539.84 197.072 524.528 206.048 500.768 206.048ZM507.104 181.496C528.488 181.496 544.592 169.352 544.592 150.608V131.072C539.312 139.256 525.848 141.104 511.064 142.952C493.64 145.064 479.12 147.44 479.12 162.224C479.12 174.368 488.888 181.496 507.104 181.496Z"
        fill="#121212"
      />
      <path
        d="M640.88 203.504H609.728V63.584H634.808L638.504 91.04C647.48 72.032 663.848 62 687.08 62H692.36V92.36H687.08C658.04 92.36 640.88 107.936 640.88 134.336V203.504Z"
        fill="#121212"
      />
      <path
        d="M753.794 206.048C721.586 206.048 700.466 190.472 700.73 164.336C700.994 131.6 733.466 124.736 760.658 121.568C781.778 119.192 797.354 118.4 797.618 107.312C797.354 93.584 786.794 84.608 768.842 84.608C750.362 84.608 737.162 94.64 735.314 109.16H703.898C706.802 79.592 733.202 59 769.37 59C807.122 59 827.978 79.592 827.978 109.424V172.784C827.978 176.744 830.09 178.856 834.842 178.856H842.498V203.144H827.714C813.458 203.144 804.746 197.336 802.37 186.776C801.842 185.456 801.314 183.608 801.05 182.024C792.866 197.072 777.554 206.048 753.794 206.048ZM760.13 181.496C781.514 181.496 797.618 169.352 797.618 150.608V131.072C792.338 139.256 778.874 141.104 764.09 142.952C746.666 145.064 732.146 147.44 732.146 162.224C732.146 174.368 741.914 181.496 760.13 181.496Z"
        fill="#121212"
      />
    </svg>
  );
};

const ConnectPanel = ({ pairings, onDelete, onConnect, setUriState, logout, uriState }: Props) => {
  const { isConnected } = useAccount();
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
    <div>
      <InfoPanel>
        <Flex alignItems="center" flexDirection="column">
          <Flex alignItems="center" justifyContent="center">
            <ParaHeader />
          </Flex>
          <Flex mt="30px">
            <Styled.SubheaderText>
              Para helps you easily onboard to and interact with the onchain apps you love. Para Portal lets you securely
              manage your Para Wallet and use it everywhere.
            </Styled.SubheaderText>
          </Flex>
          {!isConnected ? (
            <Styled.FullWidthContainer mt="25px">
              <ConnectButton />
            </Styled.FullWidthContainer>
          ) : (
            <Flex flexDirection="column" mt="30px">
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
                    <Input value={uriState} onChange={(event: any) => setUriState(event.target.value)} />
                  </Flex>
                  <Flex mb="15px">
                    <Flex alignItems="center">
                      <Button disabled={wallet?.type === 'SOLANA'} onClick={handleConnect}>
                        Connect
                      </Button>
                    </Flex>
                  </Flex>
                  <Styled.FullWidthContainer>
                    <ConnectedApps pairings={pairings} onDelete={onDelete} />
                  </Styled.FullWidthContainer>
                </>
              ) : (
                <Flex alignItems="center">
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
                    <ConnectedApps pairings={pairings} onDelete={onDelete} />
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
          )}
          {!isConnected && <PanelFooterText />}
        </Flex>
      </InfoPanel>
    </div>
  );
};

export default ConnectPanel;
