import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Capsule, { CapsuleModal, Environment, OAuthMethod } from '../../src';

describe('CapsuleModal', () => {
  beforeAll(() => {
    vi.mock('@usecapsule/user-management-client', async (importOriginal) => {
      const actual = await importOriginal();

      return {
        ...(actual as any),
        default: vi.fn().mockImplementation(() => {
          return {
            getPartner: vi.fn(() => ({ data: {} })),
            createUser: vi.fn(() => ({ userId: '123' })),
            touchSession: vi.fn(() => ({ data: {} })),
          };
        }),
      };
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it('renders first screen', async () => {
    const capsule = new Capsule(Environment.DEV, 'apikey123');
    render(
      <CapsuleModal
        isOpen={true}
        capsule={capsule}
        appName="App Name"
        oAuthMethods={[OAuthMethod.GOOGLE, OAuthMethod.FACEBOOK, OAuthMethod.APPLE]}
        onClose={() => {}}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Sign Up or Log In')).toBeDefined();
    });
    expect(screen.getByPlaceholderText('Enter your email')).toBeDefined();
    expect(screen.getByPlaceholderText('Enter phone number')).toBeDefined();
  });

  // TODO: add data-testid as optional field to all components and reimpliment using data-testid selector
  // it('can continue with email', async () => {
  //   const capsule = new Capsule(Environment.DEV, 'apikey123');
  //   render(
  //     <CapsuleModal
  //       isOpen={true}
  //       capsule={capsule}
  //       appName="App Name"
  //       oAuthMethods={[OAuthMethod.GOOGLE, OAuthMethod.FACEBOOK, OAuthMethod.APPLE]}
  //       onClose={() => {}}
  //     />,
  //   );

  //   await waitFor(() => {
  //     expect(screen.getByText('Sign Up or Log In')).toBeDefined();
  //   });
  //   const emailInput = screen.getByPlaceholderText('Enter your email');
  //   fireEvent.change(emailInput, { target: { value: 'unit-test@test.usecapsule.com' } });
  //   fireEvent.click(screen.getAllByRole('img', {})[4]);
  //   // fireEvent.click(screen.getByRole('img', {}));

  //   await waitFor(() => {
  //     expect(screen.getByText('Verify Email')).toBeDefined();
  //   });
  //   expect(screen.getByText('Verify Email')).toBeDefined();
  // });
});
