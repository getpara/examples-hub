import { ref, toValue, watch, type MaybeRefOrGetter } from "vue";

export function useAccountMenu(isConnected: MaybeRefOrGetter<boolean>) {
  const isOpen = ref(false);

  watch(
    () => toValue(isConnected),
    () => {
      isOpen.value = false;
    }
  );

  function toggle() {
    isOpen.value = !isOpen.value;
  }

  function close() {
    isOpen.value = false;
  }

  return { isOpen, toggle, close };
}
