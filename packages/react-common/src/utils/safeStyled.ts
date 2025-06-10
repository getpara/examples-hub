import styled from 'styled-components';

const createStubComponent = () => {
  const StubComponent = () => null;

  StubComponent.attrs = () => createStubComponent();
  StubComponent.withConfig = () => createStubComponent();

  return StubComponent;
};

const createStubStyled = () => {
  const styledStub = () => createStubComponent();
  const handler = {
    get: (_target: any, _prop: string) => {
      return createStubComponent;
    },
    apply: () => {
      return createStubComponent();
    },
  };
  return new Proxy(styledStub, handler);
};

export const safeStyled: typeof styled = typeof window !== 'undefined' ? styled : (createStubStyled() as any);
