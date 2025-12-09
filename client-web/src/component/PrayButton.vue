<script setup lang="ts">
  import { clicks } from '../state/clicks';
</script>

<template>
  <button @click="clicks.click()" aria-label="دکمه صلوات فرستادن" class="m-4 p-8 rounded-full cursor-pointer transition-all duration-200 hover:opacity-90 active:scale-110 border border-base-300 bg-base-200">
    <img
      src="/pray.png"
      width="64px"
      height="64px"
      alt="Pray Button Image"
    >
  </button>
</template>