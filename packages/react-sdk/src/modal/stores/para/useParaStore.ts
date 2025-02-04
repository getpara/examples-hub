import { create } from 'zustand';
import { getActions } from './actions.js';
import { ParaInternal } from '@getpara/react-common';

interface ParaState {
  para: ParaInternal | undefined;
}

export interface ParaActions {
  setPara: (para: ParaInternal) => void;
}

export type ParaStore = ParaState & ParaActions;

export const useParaStore = create<ParaStore>(set => ({
  para: undefined,
  ...getActions(set),
}));
