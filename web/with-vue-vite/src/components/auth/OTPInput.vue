<template>
  <div class="flex gap-2 justify-center" data-testid="otp-input">
    <input
      v-for="(_, index) in 6"
      :key="index"
      ref="inputs"
      type="text"
      inputmode="numeric"
      maxlength="1"
      :disabled="disabled"
      :value="values[index]"
      @input="handleInput(index, $event)"
      @keydown="handleKeyDown(index, $event)"
      @paste="handlePaste"
      class="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
      :aria-label="`Digit ${index + 1} of verification code`"
      :data-testid="`otp-input-${index}`"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

interface Props {
  modelValue: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const inputs = ref<HTMLInputElement[]>([]);
const values = ref<string[]>(['', '', '', '', '', '']);

onMounted(() => {
  // Focus first input on mount
  inputs.value[0]?.focus();
});

// Update internal values when modelValue changes
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    values.value = newValue.padEnd(6, '').split('');
  } else {
    values.value = ['', '', '', '', '', ''];
  }
});

function handleInput(index: number, event: Event) {
  const input = event.target as HTMLInputElement;
  const newValue = input.value;
  
  // Only allow digits
  if (!/^\d*$/.test(newValue)) {
    input.value = values.value[index];
    return;
  }
  
  values.value[index] = newValue;
  const fullValue = values.value.join('');
  emit('update:modelValue', fullValue);
  
  // Auto-advance to next input
  if (newValue && index < 5) {
    inputs.value[index + 1]?.focus();
  }
}

function handleKeyDown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !values.value[index] && index > 0) {
    inputs.value[index - 1]?.focus();
  }
}

function handlePaste(event: ClipboardEvent) {
  event.preventDefault();
  const pastedData = event.clipboardData?.getData('text/plain') || '';
  const digits = pastedData.replace(/\D/g, '').slice(0, 6);
  
  if (digits) {
    values.value = [...digits.padEnd(6, '').split('')];
    const fullValue = values.value.join('');
    emit('update:modelValue', fullValue);
    
    // Focus last filled input or last input
    const lastFilledIndex = Math.min(digits.length - 1, 5);
    inputs.value[lastFilledIndex]?.focus();
  }
}
</script>