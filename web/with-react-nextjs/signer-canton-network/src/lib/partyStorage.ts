function storageKey(address: string) {
  return `canton-party:${address}`;
}

export function readStoredPartyId(address: string) {
  return window.localStorage.getItem(storageKey(address)) || null;
}

export function storePartyId(address: string, partyId: string) {
  window.localStorage.setItem(storageKey(address), partyId);
}
