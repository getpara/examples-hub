// Auth types
export type AuthMethod = 'email' | 'phone' | 'google' | 'apple';

export type AuthStatus = 'idle' | 'loading' | 'verifying' | 'completing' | 'success' | 'error';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}

export interface User {
  id: string;
  email?: string;
  phone?: string;
}

export interface Wallet {
  id: string;
  address: string;
  type: string;
}

// One-click login types
export interface OneClickLoginResult {
  success: boolean;
  error?: string;
}
