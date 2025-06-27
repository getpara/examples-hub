<script lang="ts">
  import { onMount } from 'svelte';
  
  export let value: string = '';
  export let disabled: boolean = false;
  export let onChange: (value: string) => void = () => {};
  
  let inputs: HTMLInputElement[] = [];
  let values: string[] = ['', '', '', '', '', ''];
  
  onMount(() => {
    // Focus first input on mount
    inputs[0]?.focus();
  });
  
  function handleInput(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const newValue = input.value;
    
    // Only allow digits
    if (!/^\d*$/.test(newValue)) {
      input.value = values[index];
      return;
    }
    
    values[index] = newValue;
    const fullValue = values.join('');
    value = fullValue;
    onChange(fullValue);
    
    // Auto-advance to next input
    if (newValue && index < 5) {
      inputs[index + 1]?.focus();
    }
  }
  
  function handleKeyDown(index: number, event: KeyboardEvent) {
    if (event.key === 'Backspace' && !values[index] && index > 0) {
      inputs[index - 1]?.focus();
    }
  }
  
  function handlePaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text/plain') || '';
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (digits) {
      values = [...digits.padEnd(6, '').split('')];
      const fullValue = values.join('');
      value = fullValue;
      onChange(fullValue);
      
      // Focus last filled input or last input
      const lastFilledIndex = Math.min(digits.length - 1, 5);
      inputs[lastFilledIndex]?.focus();
    }
  }
</script>

<div class="flex gap-2 justify-center">
  {#each values as _, index}
    <input
      bind:this={inputs[index]}
      type="text"
      inputmode="numeric"
      maxlength="1"
      {disabled}
      value={values[index]}
      on:input={(e) => handleInput(index, e)}
      on:keydown={(e) => handleKeyDown(index, e)}
      on:paste={handlePaste}
      class="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
      aria-label={`Digit ${index + 1} of verification code`}
    />
  {/each}
</div>