import { createContext } from 'react';
import { emptyFunction } from './utils';

interface FlowContextType {
  isLogin: boolean | null;
  setIsLogin: (isLogin: boolean | null) => void;
}

const FlowContext = createContext<FlowContextType>({
  isLogin: null,
  setIsLogin: emptyFunction,
});

export default FlowContext;