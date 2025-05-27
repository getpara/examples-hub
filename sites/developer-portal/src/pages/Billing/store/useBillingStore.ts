import { create } from 'zustand';
import { getActions } from './actions.js';
import { PlanSlug } from '../../../utils/constants.js';

interface BillingState {
  newPlanSlug?: PlanSlug;
  isChangeModalOpen: boolean;
}

export interface BillingActions {
  openChangeModal: (_: PlanSlug) => void;
  setNewPlanSlug: (_: PlanSlug) => void;
  setIsChangeModalOpen: (_: boolean) => void;
}

export type BillingStore = BillingState & BillingActions;

export const DEFAULT_BILLING_STATE: BillingState = {
  newPlanSlug: undefined,
  isChangeModalOpen: false,
};

export const useBillingStore = create<BillingStore>(set => ({
  ...DEFAULT_BILLING_STATE,
  ...getActions(set),
}));
