import { vanillaStore } from './useStore.js';

export const setIsOpen = (isOpen: boolean) => vanillaStore.setState({ isOpen });
