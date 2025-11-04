import styled from 'styled-components';
import MuiMenuIcon from '@mui/icons-material/Menu';

export const Container = styled.div`
  width: 100%;
  height: 64px;
  padding: 8px, 24px, 8px, 24px;
  gap: 8px;
  background: #ffffff33;
  display: flex;
  align-items: center;
  padding: 0 75px;
  justify-content: space-between;

  @media only screen and (max-width: 768px) {
    padding: 0 25px;
  }
`;

export const MobileDrawerButon = styled.button`
  outline: none;
  cursor: pointer;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.4);
  border: none;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const MenuIcon = styled(MuiMenuIcon)`
  && {
    color: rgba(18, 18, 18, 1);
    font-size: 20px;
  }
`;
