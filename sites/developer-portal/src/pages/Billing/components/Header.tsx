import { CpslText } from '@getpara/react-components';
import styled from 'styled-components';
// import { SUPPORT_URL } from "../../../utils/constants";

export const Header = () => {
  // const handleRequestCompliance = () => {};

  return (
    <Container>
      <CpslText variant="bodyL" weight="semiBold">
        Billing
      </CpslText>
      {/* TODO: Reenable this once audits are complete */}
      {/* <CpslButton
        variant="secondary"
        size="small"
        as="a"
        href={`${SUPPORT_URL}?subject=Compliance Package Request`}
        onClick={handleRequestCompliance}
      >
        Request Compliance Package
      </CpslButton> */}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
