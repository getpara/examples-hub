import React from 'react';
import { Flex } from 'rebass';

import * as Styled from '../styles/explore';
import ExploreCard from '@/components/ExploreCard';
import useMobile from '@/hooks/MobileContext';
import LensProtocol from '@/components/exploreAssets/LensProtocolAsset';
import ParaSnapAsset from '@/components/exploreAssets/ParaSnapAsset';

const Explore = () => {
  const isMobile = useMobile();

  return (
    <Flex flexDirection="column" pl={isMobile ? '15px' : '75px'} pr={isMobile ? '15px' : '75px'} pb="40px">
      <Flex flexDirection="column" alignItems="center">
        <Styled.HeaderText>Explore</Styled.HeaderText>
        <Styled.SubheaderText>Try using Para with the following apps!</Styled.SubheaderText>
      </Flex>
      {isMobile ? (
        <div>
          <Flex mb="15px">
            <ExploreCard
              url="https://demo.getpara.com"
              name="Para Minter"
              description="Head to Para Minter to mint a special edition Para NFT."
              imageSrc={'/exploreAssets/CapsuleMinter/capsule-minter-asset.png'}
            />
          </Flex>
          <Flex mb="15px">
            <ExploreCard
              name="Lens Protocol"
              description="Lens is a web3 social protocol."
              url="https://www.lens.xyz/"
              renderSvg={() => <LensProtocol />}
            />
          </Flex>
          <Flex mb="15px">
            <ExploreCard
              name="Enso Collective"
              description="Enso is a protocol for user-owned loyalty points across apps."
              url="https://ensocollective.xyz/"
              imageSrc={'/exploreAssets/EnsoAsset/enso-asset.png'}
            />
          </Flex>
          <Flex mb="15px">
            <ExploreCard
              name="Orb"
              description="Discover fun in web3. Orb is a social app powered by Lens."
              url="https://orb.ac/"
              imageSrc={'/exploreAssets/OrbImageAsset/orb-asset.jpg'}
            />
          </Flex>
          <Flex mb="15px">
            <ExploreCard
              name="Para Snap"
              description="Para is building cross-app embedded wallets."
              url="https://snap.app.getpara.com/"
              renderSvg={() => <ParaSnapAsset />}
            />
          </Flex>
          <Flex>
            <ExploreCard
              name="Zerion"
              description="Track your portfolio & wallet balances in the Zerion Portfolio app."
              url="https://zerion.io/"
              imageSrc={'/exploreAssets/ZerionImageAsset/zerion-asset.png'}
            />
          </Flex>
        </div>
      ) : (
        <Styled.ScrollViewContainer>
          <Flex justifyContent="space-between">
            <ExploreCard
              url="https://demo.getpara.com"
              name="Para Minter"
              description="Head to Para Minter to mint a special edition Para NFT."
              imageSrc={'/exploreAssets/CapsuleMinter/capsule-minter-asset.png'}
            />
            <ExploreCard
              name="Lens Protocol"
              description="Lens is a web3 social protocol."
              url="https://www.lens.xyz/"
              renderSvg={() => <LensProtocol />}
            />
            <ExploreCard
              name="Enso Collective"
              description="Enso is a protocol for user-owned loyalty points across apps."
              url="https://ensocollective.xyz/"
              imageSrc={'/exploreAssets/EnsoAsset/enso-asset.png'}
            />
          </Flex>
          <Flex mt="30px" justifyContent="space-between">
            <ExploreCard
              name="Orb"
              description="Discover fun in web3. Orb is a social app powered by Lens."
              url="https://orb.ac/"
              imageSrc={'/exploreAssets/OrbImageAsset/orb-asset.jpg'}
            />
            <ExploreCard
              name="Para Snap"
              description="Para is building cross-app embedded wallets."
              url="https://snap.app.getpara.com/"
              renderSvg={() => <ParaSnapAsset />}
            />
            <ExploreCard
              name="Zerion"
              description="Track your portfolio & wallet balances in the Zerion Portfolio app."
              url="https://zerion.io/"
              imageSrc={'/exploreAssets/ZerionImageAsset/zerion-asset.png'}
            />
          </Flex>
        </Styled.ScrollViewContainer>
      )}
    </Flex>
  );
};

export default Explore;
