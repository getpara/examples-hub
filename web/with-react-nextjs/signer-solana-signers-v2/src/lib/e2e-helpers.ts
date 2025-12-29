/**
 * E2E Testing Helpers
 *
 * These utilities make it easier to test Para-integrated applications
 * by providing consistent selectors and helper functions.
 */

export const E2E_SELECTORS = {
  // Auth elements
  connectButton: '[data-testid="para-connect-button"]',
  modalOverlay: '[data-testid="para-modal-overlay"]',

  // Form elements
  emailInput: '[data-testid="email-input"]',
  phoneInput: '[data-testid="phone-input"]',
  submitButton: '[data-testid="submit-button"]',

  // Status elements
  successAlert: '[data-testid="success-alert"]',
  errorAlert: '[data-testid="error-alert"]',
  loadingSpinner: '[data-testid="loading-spinner"]',
} as const;

export const E2E_TIMEOUTS = {
  modalOpen: 5000,
  authComplete: 30000,
  transactionConfirm: 60000,
} as const;
