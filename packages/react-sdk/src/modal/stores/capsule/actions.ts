import { StoreApi } from 'zustand';
import { CapsuleActions, CapsuleStore } from './useCapsuleStore.js';

export const getActions = (
  set: StoreApi<CapsuleStore>['setState'],
): CapsuleActions => ({
  setCapsule: (capsule) => {
    set({ capsule });
  },
});
