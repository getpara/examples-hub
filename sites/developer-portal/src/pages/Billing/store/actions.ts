import { StoreApi } from 'zustand';
import { BillingStore, BillingActions } from './useBillingStore.js';

export const getActions = (set: StoreApi<BillingStore>['setState']): BillingActions => ({
  openChangeModal: newPlanSlug => {
    set({
      isChangeModalOpen: true,
      newPlanSlug,
    });
  },
  setNewPlanSlug: newPlanSlug => {
    set({
      newPlanSlug,
    });
  },
  setIsChangeModalOpen: isChangeModalOpen => {
    set({
      isChangeModalOpen,
    });
  },
});
