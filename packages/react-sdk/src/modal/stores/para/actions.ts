import { StoreApi } from 'zustand';
import { ParaActions, ParaStore } from './useParaStore.js';
import { ParaInternal } from '@getpara/react-common';

export const getActions = (set: StoreApi<ParaStore>['setState']): ParaActions => ({
  setPara: para => {
    set({ para: para as unknown as ParaInternal });
  },
});
