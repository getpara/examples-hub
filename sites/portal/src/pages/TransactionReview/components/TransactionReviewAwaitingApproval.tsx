import { Box, Flex } from '@chakra-ui/react';
import { CpslButton, CpslIcon } from '@usecapsule/react-components';
import { Partner } from '../../../types';
import { TransactionReviewState, TransactionType } from '../TransactionReview';
import TransactionReviewBody from './TransactionReviewBody';
import TransactionReviewFee from './TransactionReviewFee';
import { CpslHero, CpslIdenticon } from '@usecapsule/react-components';
import { PartnerIcon } from '../../../components/PartnerIcon';

export interface TransactionReviewAwaitingApprovalProps {
  partner: Partner;
  transactionValue: string;
  transactionUnits?: string;
  transactionUnitsIcon?: JSX.Element;
  fromWalletName: string;
  fromWalletAddress: string;
  toWalletAddress: string;
  transactionType: TransactionType;
  conversionRate: number;
  rawTransaction: any;
  transactionState: TransactionReviewState;
  estimatedFee: string;
  estimatedTime: string;
  network: string;
  networkIcon?: JSX.Element;
  chainId: number;
  confirmTransaction();
  rejectTransaction();
}

function TransactionReviewAwaitingApproval({
  partner,
  transactionValue,
  transactionUnits,
  transactionUnitsIcon,
  fromWalletName,
  fromWalletAddress,
  toWalletAddress,
  transactionType,
  conversionRate,
  rawTransaction,
  estimatedFee,
  estimatedTime,
  network,
  networkIcon,
  chainId,
  confirmTransaction,
  rejectTransaction,
}: TransactionReviewAwaitingApprovalProps) {
  return (
    <Box height="100%" backgroundColor="var(--cpsl-color-background-0)" width="100%">
      <Flex direction="column" alignItems="center" paddingLeft={44} paddingRight={44} width="100%">
        <Flex direction="column" align="center" gap={16} width="100%">
          <CpslHero
            variant="connection"
            title="Approve Transaction"
            subtitle="Please review the following transaction details"
          >
            <CpslIdenticon size="62px" hash={fromWalletAddress} slot="connectionLeft" />
            <div slot="connectionRight">
              <PartnerIcon partner={partner} size="62px"></PartnerIcon>
            </div>
          </CpslHero>
          <TransactionReviewBody
            transactionValue={transactionValue}
            transactionUnits={transactionUnits}
            transactionUnitsIcon={transactionUnitsIcon}
            fromWalletName={fromWalletName}
            fromWalletAddress={fromWalletAddress}
            toWalletAddress={toWalletAddress}
            transactionType={transactionType}
            conversionRate={conversionRate}
            rawTransaction={rawTransaction}
          />

          <TransactionReviewFee
            estimatedFee={estimatedFee}
            network={network}
            networkIcon={networkIcon}
            time={estimatedTime}
            chainId={chainId}
          />

          <Flex direction="column" gap={6} width="100%" marginBottom={19}>
            <CpslButton variant="primary" fullWidth onClick={confirmTransaction}>
              <CpslIcon slot="start" icon="check" />
              Confirm Transaction
            </CpslButton>
            <CpslButton variant="secondary" fullWidth onClick={rejectTransaction}>
              Reject Transaction
            </CpslButton>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}

export default TransactionReviewAwaitingApproval;
