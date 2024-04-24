import { createContext } from 'react';
import emptyFunction from '../emptyFunction';

interface EmailContextType {
  email: string | null;
  setEmail: (email: string | null) => void;
}

const EmailContext = createContext<EmailContextType>({
  email: null,
  setEmail: emptyFunction,
});

export default EmailContext;
