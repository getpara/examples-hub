import { useSnapshot } from 'valtio';
import SettingsStore from '@/store/SettingsStore';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import { Col, Row, Text, styled } from '@nextui-org/react';
import { SignClientTypes } from '@walletconnect/types';

import * as Styled from './styles';

/**
 * Types
 */
interface IProps {
  metadata: SignClientTypes.Metadata;
}

const StyledContainer = styled(Row, {
  padding: '7px',
  borderRadius: '30px',
  marginTop: '10px',
  marginBottom: '10px',
} as any);

const StyledInvalidRow = styled(StyledContainer, {
  color: '$error',
  border: '0.5px solid $error',
} as any);

const StyledInvalidContainer = styled('div', {
  textAlign: 'initial',
} as any);

const StyledDescription = styled(Text, {
  lineHeight: '20px',
  fontSize: '15px',
} as any);
/**
 * Components
 */
export default function VerifyInfobox({}: IProps) {
  const { currentRequestVerifyContext } = useSnapshot(SettingsStore.state);
  const validation = currentRequestVerifyContext?.verified.validation;
  return (
    <div style={{ textAlign: 'center' }}>
      {currentRequestVerifyContext?.verified.isScam ? (
        <StyledInvalidRow>
          <Col style={{ margin: 'auto' }} span={2}>
            <NewReleasesIcon style={{ verticalAlign: 'bottom' }} />
          </Col>
          <Col style={{ margin: 'auto' }}>
            <Row>Known secury risk</Row>
            <Row>
              <StyledInvalidContainer>
                <StyledDescription>
                  This website is flagged as unsafe by multiple security reports. Leave immediately to protect your assets.
                </StyledDescription>
              </StyledInvalidContainer>
            </Row>
          </Col>
        </StyledInvalidRow>
      ) : validation === 'UNKNOWN' ? (
        <Styled.Container>
          <Styled.WarningIcon />
          <div>
            <Styled.Title>Unknown domain</Styled.Title>
            <Styled.Description>
              This domain cannot be verified. Please check the request carefully before approving.
            </Styled.Description>
          </div>
        </Styled.Container>
      ) : validation === 'INVALID' ? (
        <StyledInvalidRow>
          <Col style={{ margin: 'auto' }} span={2}>
            <ReportProblemIcon style={{ verticalAlign: 'bottom' }} />
          </Col>
          <Col style={{ margin: 'auto' }}>
            <Row>
              <>Domain mismatch</>
            </Row>
            <Row>
              <StyledInvalidContainer>
                <StyledDescription>
                  This website has a domain that does not match the sender of this request. Approving may lead to loss of
                  funds.
                </StyledDescription>
              </StyledInvalidContainer>
            </Row>
          </Col>
        </StyledInvalidRow>
      ) : null}
    </div>
  );
}
