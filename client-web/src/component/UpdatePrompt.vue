<script setup lang="ts">
  import { useRegisterSW } from 'virtual:pwa-register/vue'

  const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000

  const { needRefresh, updateServiceWorker } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return

      setInterval(() => registration.update(), UPDATE_CHECK_INTERVAL)
    }
  })
</script>

<template>
  <div v-if="needRefresh" role="alert" class="fixed bottom-4 inset-x-4 z-50 mx-auto max-w-md alert shadow-lg border border-base-300 bg-base-100 text-base-content">
    <span>نسخه جدید صلوات مدرسه در دسترسه!</span>
    <div class="flex gap-2">
      <button class="btn btn-ghost btn-sm" @click="needRefresh = false">بعدا</button>
      <button class="btn btn-primary btn-sm" @click="updateServiceWorker()">بروزرسانی</button>
    </div>
  </div>
</template>
