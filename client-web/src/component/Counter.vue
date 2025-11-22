<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { CountUp } from 'countup.js';

interface Props {
  value: number;
}

const props = defineProps<Props>();
const counterRef = ref<HTMLElement | null>(null);
let countUpInstance: CountUp;

onMounted(() => {
  if (counterRef.value) {
    countUpInstance = new CountUp(counterRef.value, props.value, { duration: 0.4 });
    countUpInstance.start();
  }
});

watch(() => props.value, (newVal) => {
  countUpInstance?.update(newVal);
});
</script>

<template>
  <div>
    <slot></slot>
    <span ref="counterRef">{{ props.value }}</span>
  </div>
</template>