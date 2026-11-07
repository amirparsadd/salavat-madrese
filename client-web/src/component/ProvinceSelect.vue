<script setup lang="ts">
  import { PROVINCES } from '../provinces'
  import { selectedProvince } from '../state/province'
</script>

<template>
  <select v-model="selectedProvince" aria-label="انتخاب استان" class="select select-sm select-bordered w-auto">
    <option value="" disabled>استانت رو انتخاب کن</option>
    <option v-for="province in PROVINCES" :key="province.id" :value="province.id">{{ province.name }}</option>
  </select>
</template>
