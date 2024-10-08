import { Flex, Spacer } from '@chakra-ui/react';
import { useState } from 'react';
import { CpslButton, CpslIcon, CpslText } from '@usecapsule/react-components';
import styled from 'styled-components';
import { TransactionType } from '../TransactionReview';

export interface TransactionCoin {
  value: number;
  units: string;
  conversionRate?: number;
  icon?: JSX.Element;
}

export interface TransactionReviewBodyProps {
  coins: TransactionCoin[];
  fromWalletName: string;
  fromWalletAddress: string;
  toWalletAddress: string;
  transactionType: TransactionType;
  rawTransaction: any;
}

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function walletAddressFormatted(walletAddress: string): string {
  return walletAddress.substring(0, 5) + '...' + walletAddress.substring(walletAddress.length - 4);
}

function rawTransactionFormatted(rawTransaction: any): string {
  const res = JSON.stringify(rawTransaction, null, 2);

  return res;
}

function priceInUsdFormatted(conversionRate: number, value: number): string {
  const usdValue = conversionRate * value;

  return usdValue < 0.01 ? '< $0.01' : formatter.format(usdValue);
}

function TransactionReviewBody({
  coins,
  fromWalletName,
  fromWalletAddress,
  toWalletAddress,
  transactionType,
  rawTransaction,
}: TransactionReviewBodyProps) {
  const [viewFullTransaction, setViewFullTransaction] = useState(false);

  function handleViewFullTransaction() {
    setViewFullTransaction(!viewFullTransaction);
  }

  return (
    <Flex
      direction="column"
      border="1px solid var(--cpsl-color-background-16)"
      borderRadius={16}
      width="100%"
      paddingTop={24}
      paddingBottom={24}
    >
      <Flex direction="column" paddingLeft={24} paddingRight={24} gap={20}>
        <Flex direction="column">
          <CpslText variant="bodyS" color="secondary">
            You Send
          </CpslText>
          <Flex gap={5} width={'100%'}>
            <CpslText variant="bodyXL">{fromWalletName}</CpslText>
            <Spacer />
            <Flex align="center" gap={0}>
              {coins[0].icon && coins[0].icon}
              <CpslText variant="bodyXL">
                {coins[0].value} {coins[0].units}
              </CpslText>
            </Flex>
          </Flex>
          <Flex gap={6} align="center">
            <CpslText variant="bodyS" color="secondary" weight="regular">
              {walletAddressFormatted(fromWalletAddress)}
            </CpslText>
            <CpslButton
              variant="ghost"
              size="small"
              onClick={async () => {
                navigator.clipboard.writeText(fromWalletAddress);
              }}
            >
              <CpslIcon slot="start" icon="copy" />
            </CpslButton>
            <Spacer />
            <CpslText variant="bodyS" color="secondary" weight="regular">
              {coins[0].conversionRate ? priceInUsdFormatted(coins[0].conversionRate, coins[0].value) : '...'}
            </CpslText>
          </Flex>
        </Flex>
        {coins.length > 1 &&
          coins.slice(1).map((coin, index) => (
            <Flex key={`coin-${index}`} direction="column">
              <Flex align="center">
                <Spacer />
                <PlusIcon icon="plus" />
                {coin.icon && coin.icon}
                <CpslText variant="bodyXL">
                  {coin.value} {coin.units}
                </CpslText>
              </Flex>
              <Flex align="center">
                <Spacer />
                <CpslText variant="bodyS" color="secondary" weight="regular">
                  {coin.conversionRate ? priceInUsdFormatted(coin.conversionRate, coin.value) : '...'}
                </CpslText>
              </Flex>
            </Flex>
          ))}
      </Flex>

      <Flex width="100%" align="center">
        <TransactionDetailsSeparator />
        <CpslIcon icon="arrowCircleDownFilled" />
        <TransactionDetailsSeparator />
      </Flex>
      <Flex direction="column" paddingLeft={24} paddingRight={24}>
        <CpslText variant="bodyS" color="secondary">
          To
        </CpslText>
        <Flex gap={5} align="center">
          <CpslText variant="bodyXL">{walletAddressFormatted(toWalletAddress)}</CpslText>
          <CpslButton
            variant="ghost"
            size="small"
            onClick={async () => {
              navigator.clipboard.writeText(toWalletAddress);
            }}
          >
            <CpslIcon slot="start" icon="copy" />
          </CpslButton>
          <Spacer />
          <CpslText variant="bodyXL">{transactionType.toString()}</CpslText>
        </Flex>
        <Flex>
          <Spacer />
          <CpslButton variant="ghost" size="small" onClick={handleViewFullTransaction}>
            View Full Transaction
            <CpslIcon slot="end" icon={viewFullTransaction ? 'chevronUp' : 'chevronDown'} />
          </CpslButton>
        </Flex>
        {viewFullTransaction && (
          <Flex
            backgroundColor="var(--cpsl-color-background-8)"
            border="1px solid var(--cpsl-color-background-16)"
            borderRadius={8}
            padding={24}
            marginTop={8}
          >
            <RawTransactionText>{rawTransactionFormatted(rawTransaction)}</RawTransactionText>
            <Spacer />
            <CpslButton
              variant="ghost"
              onClick={async () => {
                navigator.clipboard.writeText(rawTransaction);
              }}
            >
              <CpslIcon slot="start" icon="copy" />
            </CpslButton>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}

const PlusIcon = styled(CpslIcon)`
  --height: 16px;
  --width: 16px;
`;

const TransactionDetailsSeparator = styled.div`
  height: 1px;
  border: 0;
  border-top: 1px solid var(--cpsl-color-background-16);
  margin: 1em 0;
  padding: 0;
  width: 50%;
`;

const RawTransactionText = styled(CpslText)`
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  &::part(text-element) {
    font-family: monospace;
  }
`;

export default TransactionReviewBody;
