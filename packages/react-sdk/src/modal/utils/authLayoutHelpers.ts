import { TAuthLayout } from '../types/modalProps.js';

export const hasExternalWallet = (authLayout: TAuthLayout[]) => authLayout.find(layout => layout.includes('EXTERNAL'));
export const hasEmbeddedAuth = (authLayout: TAuthLayout[]) => authLayout.find(layout => layout.includes('AUTH'));
