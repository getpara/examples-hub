import { createContext } from 'react';
import emptyFunction from '../emptyFunction';

interface TwoFactorContextType {
  is2FAFlow: boolean | null;
  setIs2FAFlow: (is2FAFlow: boolean | null) => void;
}

const TwoFactorContext = createContext<TwoFactorContextType>({
  is2FAFlow: true,
  setIs2FAFlow: emptyFunction,
});

export default TwoFactorContext;