export {};

declare global {
  interface Window {
    ethereum?: WindowProvider;
  }
}
