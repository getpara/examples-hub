import { writable } from 'svelte/store';
import { para } from '@/lib/para/client';
import { checkAuthentication } from './paraAccount';
import type { AuthState, TOAuthMethod } from '@getpara/web-sdk';

export type AuthStep = 'select' | 'email' | 'phone' | 'oauth' | 'verify' | 'login';

interface AuthModalState {
  isOpen: boolean;
  step: AuthStep;
  activeTab: 'email' | 'phone';
  email: string;
  countryCode: string;
  phoneNumber: string;
  verificationCode: string;
  selectedOAuthMethod: TOAuthMethod | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthModalState = {
  isOpen: false,
  step: 'select',
  activeTab: 'email',
  email: '',
  countryCode: '+1',
  phoneNumber: '',
  verificationCode: '',
  selectedOAuthMethod: null,
  isLoading: false,
  error: null,
};

export const authModal = writable<AuthModalState>(initialState);

// Modal controls
export function openModal() {
  authModal.update(state => ({ ...state, isOpen: true }));
}

export function closeModal() {
  authModal.set(initialState);
}

// Email authentication
export async function signUpOrLoginWithEmail(email: string): Promise<AuthState> {
  authModal.update(state => ({ ...state, isLoading: true, error: null }));
  
  try {
    const authState = await para.signUpOrLogIn({ auth: { email } });
    
    if (authState.stage === 'verify') {
      authModal.update(state => ({ ...state, step: 'verify', isLoading: false }));
    } else if (authState.stage === 'login') {
      authModal.update(state => ({ ...state, step: 'login', isLoading: false }));
    }
    
    return authState;
  } catch (error: any) {
    authModal.update(state => ({
      ...state,
      isLoading: false,
      error: error.message || 'Authentication failed',
    }));
    throw error;
  }
}

// Phone authentication
export async function signUpOrLoginWithPhone(phoneNumber: string, countryCode: string): Promise<AuthState> {
  authModal.update(state => ({ ...state, isLoading: true, error: null }));
  
  try {
    // Combine country code and phone number for the modern phone auth format
    const fullPhoneNumber = `${countryCode}${phoneNumber}` as `+${number}`;
    const authState = await para.signUpOrLogIn({ 
      auth: { phone: fullPhoneNumber } 
    });
    
    if (authState.stage === 'verify') {
      authModal.update(state => ({ ...state, step: 'verify', isLoading: false }));
    } else if (authState.stage === 'login') {
      authModal.update(state => ({ ...state, step: 'login', isLoading: false }));
    }
    
    return authState;
  } catch (error: any) {
    authModal.update(state => ({
      ...state,
      isLoading: false,
      error: error.message || 'Authentication failed',
    }));
    throw error;
  }
}

// Verify account with OTP
export async function verifyAccount(verificationCode: string): Promise<AuthState> {
  authModal.update(state => ({ ...state, isLoading: true, error: null }));
  
  try {
    const authState = await para.verifyNewAccount({ verificationCode });
    authModal.update(state => ({ ...state, isLoading: false }));
    return authState;
  } catch (error: any) {
    authModal.update(state => ({
      ...state,
      isLoading: false,
      error: error.message === 'Invalid verification code'
        ? 'Verification code incorrect or expired'
        : error.message || 'Verification failed',
    }));
    throw error;
  }
}

// OAuth authentication
export async function verifyOAuth(
  method: TOAuthMethod,
  onOAuthUrl: (url: string) => void,
  isCanceled?: () => boolean
): Promise<AuthState> {
  authModal.update(state => ({ 
    ...state, 
    isLoading: true, 
    error: null,
    selectedOAuthMethod: method 
  }));
  
  try {
    let authState: AuthState;
    
    if (method === 'FARCASTER') {
      authState = await para.verifyFarcaster({
        onConnectUri: onOAuthUrl,
        isCanceled,
      });
    } else {
      authState = await para.verifyOAuth({
        method: method as Exclude<TOAuthMethod, "TELEGRAM" | "FARCASTER">,
        onOAuthUrl,
        isCanceled,
      });
    }
    
    authModal.update(state => ({ ...state, isLoading: false }));
    return authState;
  } catch (error: any) {
    authModal.update(state => ({
      ...state,
      isLoading: false,
      error: error.message || 'OAuth authentication failed',
      selectedOAuthMethod: null,
    }));
    throw error;
  }
}

// Wait for login completion
export async function waitForLogin(isCanceled?: () => boolean) {
  const result = await para.waitForLogin({ isCanceled });
  
  if (result.needsWallet) {
    await para.createWallet({ skipDistribute: false });
  }
  
  await checkAuthentication();
  closeModal();
  
  return result;
}

// Wait for wallet creation
export async function waitForWalletCreation(isCanceled?: () => boolean) {
  const result = await para.waitForWalletCreation({ isCanceled });
  await checkAuthentication();
  closeModal();
  
  return result;
}

// Logout
export async function logout() {
  authModal.update(state => ({ ...state, isLoading: true, error: null }));
  
  try {
    await para.logout();
    await checkAuthentication();
    closeModal();
  } catch (error: any) {
    authModal.update(state => ({
      ...state,
      isLoading: false,
      error: error.message || 'Failed to logout',
    }));
    throw error;
  }
}