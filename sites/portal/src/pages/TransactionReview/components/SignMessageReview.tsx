import { Box, Flex, Spacer } from '@chakra-ui/react';
import { CpslButton, CpslHero, CpslIcon, CpslIdenticon } from '@usecapsule/react-components';
import { Partner } from '../../../types';
import { PartnerIcon } from '../../../components/PartnerIcon';
import styled from 'styled-components';

export interface SignMessageReviewProps {
  partner: Partner;
  fromWalletAddress: string;
  message: string;
  confirmSignMessage();
  rejectSignMessage();
}

function SignMessageReview({
  partner,
  fromWalletAddress,
  message,
  confirmSignMessage,
  rejectSignMessage,
}: SignMessageReviewProps) {
  return (
    <Box height="100%" width="100%">
      <Flex direction="column" alignItems="center" paddingLeft={44} paddingRight={44} width="100%">
        <Flex direction="column" align="center" gap={16} width="100%">
          <CpslHero variant="connection" title="Signature Request" subtitle="Signing the following message is free">
            <CpslIdenticon size="62px" hash={fromWalletAddress} slot="connectionLeft" />
            <div slot="connectionRight">
              <PartnerIcon partner={partner} size="62px"></PartnerIcon>
            </div>
          </CpslHero>

          <MessageContainer align="start">
            <Message>{message}</Message>
            <Spacer />
            <CpslButton
              variant="ghost"
              size="medium"
              onClick={async () => {
                navigator.clipboard.writeText(message);
              }}
            >
              <CpslIcon slot="start" icon="copy" color="black" />
            </CpslButton>
          </MessageContainer>

          <Flex direction="column" gap={6} width="100%" marginBottom={19}>
            <CpslButton variant="primary" fullWidth onClick={confirmSignMessage}>
              <CpslIcon slot="start" icon="check" />
              Sign Message
            </CpslButton>
            <CpslButton variant="secondary" fullWidth onClick={rejectSignMessage}>
              Reject Request
            </CpslButton>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}

const MessageContainer = styled(Flex)`
  background-color: var(--cpsl-color-background-4);
  border: 1px solid var(--cpsl-color-modal-border);
  border-radius: 16px;
  padding: 24px;
  margin-top: 8px;
  width: 100%;
  gap: 8px;
`;

const Message = styled.div`
  overflow-wrap: anywhere;
`;

export default SignMessageReview;
