<script setup lang="ts">
  import { onMounted } from 'vue';
  import { configs } from './state/configs';
  import { clicks } from './state/clicks';
  import { interval } from './state/interval';
  import Counter from './component/Counter.vue';
  import Footer from './component/Footer.vue';
  import ShareButton from './component/ShareButton.vue';

  onMounted(() => {
    clicks.fetch()
    configs.fetch()
    interval.restart()
  })
</script>

<template>
  <main class="w-screen h-dvh bg-slate-200 flex flex-col items-center justify-center p-4">
    <div class="flex-1 flex flex-col items-center justify-center">
      <h1 class="text-3xl font-bold">صلوات مدرسه</h1>
      <p>اینجا میتونی همراه با سایر دانش آموزان ایران بشینی و برای تعطیلی مدارس صلوات بفرستی :)</p>
      <button @click="clicks.click()" aria-label="دکمه صلوات فرستادن" class="m-4 p-8 rounded-full cursor-pointer hover:opacity-90 active:scale-110 border border-slate-300 bg-slate-50">
        <img src="/pray.png" width="64px" height="64px">
      </button>
      <div v-if="!clicks.loading">
        <h2 class="flex gap-1 text-xl font-semibold">
          <span>آمار و ارقام</span>
          <img src="/barchart.png" alt="تصویر آمار" width="24px" height="24px">
        </h2>
        <Counter v-if="clicks.today !== clicks.today" :value="clicks.total">کل صلوات ها: </Counter>
        <Counter :value="clicks.today">صلوات های امروز: </Counter>
      </div>
      <ShareButton />
    </div>
    <Footer />
  </main>
</template>
