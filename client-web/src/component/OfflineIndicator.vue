<script setup lang="ts">
  import { offline } from '../state/offline';
</script>

<template>
  <div v-if="offline.isOffline" class="fixed p-1 text-center top-0 left-0 w-full bg-red-400 text-white">
    نتونستیم به سرور وصل شیم. یا نت تو ریده یا نت ما.
  </div>
</template>