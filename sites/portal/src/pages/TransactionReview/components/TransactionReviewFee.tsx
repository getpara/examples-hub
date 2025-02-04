import { Flex, Spacer } from '@chakra-ui/react';
import { CpslText } from '@getpara/react-components';

export interface TransactionReviewFeeProps {
  estimatedFee: string;
  network: string;
  networkIcon?: JSX.Element;
  time: string;
  chainId: string;
}

function TransactionReviewFee({ estimatedFee, network, networkIcon, time, chainId }: TransactionReviewFeeProps) {
  return (
    <Flex direction="column" border="1px solid var(--cpsl-color-background-16)" borderRadius={16} width="100%" padding={24}>
      <Flex gap={5}>
        <CpslText variant="bodyL">Estimated Fee</CpslText>
        <Spacer />
        <CpslText variant="bodyL">{estimatedFee}</CpslText>
      </Flex>

      <Flex align={'center'} gap={3}>
        <CpslText variant="bodyS" color="secondary" weight="regular">
          {network ? 'Network:' : 'Chain Id:'}
        </CpslText>
        <Flex gap={0} align={'center'}>
          {networkIcon}
          <CpslText variant="bodyS" color="secondary" weight="regular">
            {network ? network : chainId}
          </CpslText>
        </Flex>
        <Spacer />
        <CpslText variant="bodyS" color="secondary" weight="regular">
          {time}
        </CpslText>
      </Flex>
    </Flex>
  );
}

export default TransactionReviewFee;
