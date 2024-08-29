import { ToastContainer as BaseToastContainer } from 'react-toastify';
import styled from 'styled-components';

export const ToastContainer = () => {
  return <StyledToastContainer position="bottom-right" autoClose={5000} hideProgressBar />;
};

const StyledToastContainer = styled(BaseToastContainer)`
  .Toastify__toast {
    padding: 16px;
    border: 1px solid;
    border-radius: 16px;
    box-shadow: 0px 8px 8px -4px rgba(0, 0, 0, 0.08);
  }
  .Toastify__toast--success {
    border-color: var(--cpsl-color-utility-green);
  }
  .Toastify__toast--error {
    border-color: var(--cpsl-color-utility-red);
  }
  .Toastify__toast--warning {
    border-color: var(--cpsl-color-utility-yellow);
  }
  .Toastify__toast-body {
    padding: 0px;
    margin: 0px;
  }
`;
