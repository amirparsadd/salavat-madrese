<script setup lang="ts">
  import { ref, watch, onMounted } from 'vue'
  import { CountUp } from 'countup.js'

  interface Props {
    value: number
  }

  const props = defineProps<Props>()
  const counterRef = ref<HTMLElement | null>(null)
  let countUpInstance: CountUp

  onMounted(() => {
    if (counterRef.value) {
      const duration = Math.min(2, Math.log10(props.value + 1) * 0.3)
      countUpInstance = new CountUp(counterRef.value, props.value, {
        duration: duration,
        formattingFn: n => n.toLocaleString("fa-IR"),
        easingFn: (t, b, c, d) => {
          const progress = t / d
          const smallIncrement = c === 1
          
          // if the increment is tiny, skip all of the animation
          if (smallIncrement) {
            return b + c
          }

          // normal easeOutQuart for larger jumps
          // https://easings.net/#easeOutQuart
          return b + c * (1 - Math.pow(1 - progress, 4))
        }
      })
      countUpInstance.start()
    }
  })

  watch(() => props.value, (newVal) => {
    countUpInstance?.update(newVal)
  })
</script>

<template>
  <div>
    <slot></slot>
    <span ref="counterRef">{{ props.value }}</span>
  </div>
</template>