<template>
  <div class="flex min-h-screen flex-col bg-background font-sans text-foreground">
    <slot name="header" />
    <main class="flex flex-1 flex-col"><slot /></main>
    <slot name="footer" />
  </div>
</template>
