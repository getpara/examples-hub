import { create } from 'zustand';
import { getActions } from './actions.js';
import CapsuleWeb from '@usecapsule/web-sdk';

interface CapsuleState {
  capsule: CapsuleWeb | undefined;
}

export interface CapsuleActions {
  setCapsule: (capsule: CapsuleWeb) => void;
}

export type CapsuleStore = CapsuleState & CapsuleActions;

export const useCapsuleStore = create<CapsuleStore>(set => ({
  capsule: undefined,
  ...getActions(set),
}));
