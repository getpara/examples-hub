import { reactive } from 'vue';
import { para } from '@/lib/para/client';
import { useParaAccount } from './useParaAccount';
import type { AuthState, TOAuthMethod } from '@getpara/web-sdk';

export type AuthStep = 'select' | 'email' | 'phone' | 'verify' | 'login';

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

const state = reactive<AuthModalState>({
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
});

export function useParaAuth() {
  const { checkAuthentication } = useParaAccount();
  
  function openModal() {
    state.isOpen = true;
  }
  
  function closeModal() {
    Object.assign(state, {
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
    });
  }
  
  function setActiveTab(tab: 'email' | 'phone') {
    state.activeTab = tab;
    state.step = tab === 'email' ? 'email' : 'phone';
    state.error = null;
  }
  
  async function signUpOrLoginWithEmail(email: string): Promise<AuthState> {
    state.isLoading = true;
    state.error = null;
    
    try {
      const authState = await para.signUpOrLogIn({ auth: { email } });
      
      if (authState.stage === 'verify') {
        state.step = 'verify';
      } else if (authState.stage === 'login') {
        state.step = 'login';
      }
      
      return authState;
    } catch (error: any) {
      state.error = error.message || 'Authentication failed';
      throw error;
    } finally {
      state.isLoading = false;
    }
  }
  
  async function signUpOrLoginWithPhone(phoneNumber: string, countryCode: string): Promise<AuthState> {
    state.isLoading = true;
    state.error = null;
    
    try {
      const fullPhoneNumber = `${countryCode}${phoneNumber}` as `+${number}`;
      const authState = await para.signUpOrLogIn({ 
        auth: { phone: fullPhoneNumber } 
      });
      
      if (authState.stage === 'verify') {
        state.step = 'verify';
      } else if (authState.stage === 'login') {
        state.step = 'login';
      }
      
      return authState;
    } catch (error: any) {
      state.error = error.message || 'Authentication failed';
      throw error;
    } finally {
      state.isLoading = false;
    }
  }
  
  async function verifyAccount(verificationCode: string): Promise<AuthState> {
    state.isLoading = true;
    state.error = null;
    
    try {
      const authState = await para.verifyNewAccount({ verificationCode });
      return authState;
    } catch (error: any) {
      state.error = error.message === 'Invalid verification code'
        ? 'Verification code incorrect or expired'
        : error.message || 'Verification failed';
      throw error;
    } finally {
      state.isLoading = false;
    }
  }
  
  async function verifyOAuth(
    method: TOAuthMethod,
    onOAuthUrl: (url: string) => void,
    isCanceled?: () => boolean
  ): Promise<AuthState> {
    state.isLoading = true;
    state.error = null;
    state.selectedOAuthMethod = method;
    
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
      
      return authState;
    } catch (error: any) {
      state.error = error.message || 'OAuth authentication failed';
      throw error;
    } finally {
      state.isLoading = false;
      state.selectedOAuthMethod = null;
    }
  }
  
  async function waitForLogin(isCanceled?: () => boolean) {
    const result = await para.waitForLogin({ isCanceled });
    
    if (result.needsWallet) {
      await para.createWallet({ skipDistribute: false });
    }
    
    await checkAuthentication();
    closeModal();
    
    return result;
  }
  
  async function waitForWalletCreation(isCanceled?: () => boolean) {
    const result = await para.waitForWalletCreation({ isCanceled });
    await checkAuthentication();
    closeModal();
    
    return result;
  }
  
  async function logout() {
    state.isLoading = true;
    state.error = null;
    
    try {
      await para.logout();
      await checkAuthentication();
      closeModal();
    } catch (error: any) {
      state.error = error.message || 'Failed to logout';
      throw error;
    } finally {
      state.isLoading = false;
    }
  }
  
  return {
    state,
    openModal,
    closeModal,
    setActiveTab,
    signUpOrLoginWithEmail,
    signUpOrLoginWithPhone,
    verifyAccount,
    verifyOAuth,
    waitForLogin,
    waitForWalletCreation,
    logout,
  };
}