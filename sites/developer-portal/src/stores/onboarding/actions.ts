import { StoreApi } from 'zustand';
import { OnboardingStore, OnboardingActions } from './useOnboardingStore.js';

export const getActions = (
  set: StoreApi<OnboardingStore>['setState'],
  get: StoreApi<OnboardingStore>['getState'],
): OnboardingActions => ({
  setStep: (userId, step) => {
    if (!userId) {
      return;
    }

    const currentMapClone = { ...get().userStepMap };

    currentMapClone[userId] = step;

    set({
      userStepMap: currentMapClone,
    });
  },
  getStep: userId => {
    return get().userStepMap[userId ?? ''];
  },
});
