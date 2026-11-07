<script setup lang="ts">
  import { useOffline } from '../queries/offline'

  const isOffline = useOffline()
</script>

<template>
  <div v-if="isOffline" class="fixed p-1 text-center top-0 left-0 w-full bg-error text-error-content">
    نتونستیم به سرور وصل شیم. یا نت تو ریده یا نت ما.
  </div>
</template>
