<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { PROVINCES } from '../provinces'
  import { selectedProvince } from '../state/province'

  interface Props {
    provinceClicks: Record<string, number>
  }

  const props = defineProps<Props>()
  const isOpen = ref(false)

  const ranking = computed(() => PROVINCES
    .map(province => ({ ...province, count: props.provinceClicks[province.id] ?? 0 }))
    .sort((a, b) => b.count - a.count)
  )
</script>

<template>
  <button class="btn btn-outline btn-primary btn-sm" @click="isOpen = true">جدول استان ها</button>
  <div class="modal" :class="{ 'modal-open': isOpen }" role="dialog">
    <div class="modal-box">
      <h3 class="text-lg font-bold">جدول استان ها</h3>
      <ol class="mt-4 flex flex-col gap-2">
        <li
          v-for="(province, index) in ranking"
          :key="province.id"
          class="flex justify-between items-center p-2 rounded-box border border-base-300"
          :class="province.id === selectedProvince ? 'bg-primary text-primary-content' : 'bg-base-200'"
        >
          <span>{{ (index + 1).toLocaleString("fa-IR") }}. {{ province.name }}</span>
          <span class="font-bold">{{ province.count.toLocaleString("fa-IR") }}</span>
        </li>
      </ol>
      <div class="modal-action">
        <button class="btn" @click="isOpen = false">بستن</button>
      </div>
    </div>
    <div class="modal-backdrop" @click="isOpen = false"></div>
  </div>
</template>
