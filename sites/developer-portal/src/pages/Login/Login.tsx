import { useState } from 'react';
import { Main } from './components/Main';
import { Loading } from './components/Loading';
import styled from 'styled-components';

export const Login = () => {
  const [isLoading, setIsLoading] = useState(true);

  return <Container>{isLoading ? <Loading setIsLoading={setIsLoading} /> : <Main setIsLoading={setIsLoading} />}</Container>;
};

const Container = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;
