import { createContext, useContext, ReactNode } from 'react';
import { Environment } from '@getpara/core-sdk';

interface EnvironmentContextType {
  selectedEnv: Environment;
  selectedApiKey: string;
  setSelectedEnv: (env: Environment) => void;
  setSelectedApiKey: (apiKey: string) => void;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

export const useEnvironment = () => {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
};

interface EnvironmentProviderProps {
  children: ReactNode;
  value: EnvironmentContextType;
}

export const EnvironmentProvider = ({ children, value }: EnvironmentProviderProps) => {
  return <EnvironmentContext.Provider value={value}>{children}</EnvironmentContext.Provider>;
};
