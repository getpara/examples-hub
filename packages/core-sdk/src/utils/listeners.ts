import * as constants from '../constants.js';

export function storageListener(e: StorageEvent) {
  if (!e.url.includes(window.location.origin)) {
    return;
  }

  if (e.key === constants.LOCAL_STORAGE_CURRENT_EXTERNAL_WALLET_ADDRESSES) {
    this.updateCurrentExternalWalletAddressesFromStorage();
  }
  if (e.key === constants.LOCAL_STORAGE_EXTERNAL_WALLETS) {
    this.updateExternalWalletsFromStorage();
  }
  if (e.key === constants.SESSION_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR) {
    this.updateLoginEncryptionKeyPairFromStorage();
  }
  if (e.key === constants.LOCAL_STORAGE_SESSION_COOKIE) {
    this.updateSessionCookieFromStorage();
  }
  if (e.key === constants.LOCAL_STORAGE_CURRENT_WALLET_IDS) {
    this.updateWalletIdsFromStorage();
  }
  if (e.key === constants.LOCAL_STORAGE_WALLETS || e.key === constants.LOCAL_STORAGE_ED25519_WALLETS) {
    this.updateWalletsFromStorage();
  }
  if (e.key === constants.LOCAL_STORAGE_EMAIL) {
    this.updateEmailFromStorage();
  }
  if (e.key === constants.LOCAL_STORAGE_COUNTRY_CODE) {
    this.updateCountryCodeFromStorage();
  }
  if (e.key === constants.LOCAL_STORAGE_PHONE) {
    this.updatePhoneFromStorage();
  }
  if (e.key === constants.LOCAL_STORAGE_USER_ID) {
    this.updateUserIdFromStorage();
  }
  if (e.key === constants.LOCAL_STORAGE_TELEGRAM_USER_ID) {
    this.updateTelegramUserIdFromStorage();
  }
}

export function setupListeners() {
  if (typeof window !== 'undefined' && window.addEventListener && window.location) {
    // Remove any old listeners before adding new ones
    window.removeEventListener('storage', storageListener.bind(this));

    window.addEventListener('storage', storageListener.bind(this));
  }
}
