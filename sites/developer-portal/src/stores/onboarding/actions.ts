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
  setInput: (userId, key, value) => {
    if (!userId) {
      return;
    }

    const currentMapClone = { ...get().userInputMap };

    currentMapClone[userId] = {
      ...currentMapClone[userId],
      [key]: value,
    };

    set({
      userInputMap: currentMapClone,
    });
  },
  getInput: userId => {
    return get().userInputMap[userId ?? ''];
  },
  setDirection: direction => set({ direction }),
  setLogoFile: logoFile => set({ logoFile }),
  resetUser: userId => {
    if (!userId) {
      return;
    }

    const currentInputMapClone = { ...get().userInputMap };
    delete currentInputMapClone[userId];

    const currentStepMapClone = { ...get().userStepMap };
    delete currentStepMapClone[userId];

    set({
      userInputMap: currentInputMapClone,
      userStepMap: currentStepMapClone,
    });
  },
});
