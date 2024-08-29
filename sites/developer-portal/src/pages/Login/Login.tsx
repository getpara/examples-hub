import { useState } from 'react';
import { Main } from './components/Main';
import { Loading } from './components/Loading';

export const Login = () => {
  const [isLoading, setIsLoading] = useState(true);

  return isLoading ? <Loading setIsLoading={setIsLoading} /> : <Main setIsLoading={setIsLoading} />;
};
