import React from 'react';
import { Flex } from 'rebass';

import * as Styled from './styles';

const PanelFooterText = () => {
  return (
    <Flex>
      <Styled.FooterText>
        To learn more about what you can do with Para Portal, check out the instructions below or visit the{' '}
        <Styled.BoldText onClick={() => window.open('https://help.getpara.com/', '_blank')}>Help Center</Styled.BoldText>
      </Styled.FooterText>
    </Flex>
  );
};

export default PanelFooterText;
