<script setup lang="ts">
  import { onMounted } from 'vue';
  import { configs } from './state/configs';
  import { clicks } from './state/clicks';
  import { interval } from './state/interval';
  import Counter from './component/Counter.vue';
  import Footer from './component/Footer.vue';
  import ShareButton from './component/ShareButton.vue';
  import { offline } from './state/offline';
  import OfflineIndicator from './component/OfflineIndicator.vue';
  import PrayButton from './component/PrayButton.vue';

  onMounted(() => {
    interval.restart()
    offline.checkOffline()
    clicks.sync()
    clicks.fetch()
    configs.fetch()
  })
</script>

<template>
  <main class="w-screen h-dvh bg-slate-200 flex flex-col items-center justify-center p-4">
    <OfflineIndicator />
    <div class="flex-1 flex flex-col items-center justify-center">
      <h1 class="text-3xl font-bold">صلوات مدرسه</h1>
      <p>اینجا میتونی همراه با سایر دانش آموزان ایران بشینی و برای تعطیلی مدارس صلوات بفرستی :)</p>
      <PrayButton />
      <div>
        <h2 class="flex gap-1 text-xl font-semibold">
          <span>آمار و ارقام</span>
          <img src="/barchart.png" alt="تصویر آمار" width="24px" height="24px">
        </h2>
        <Counter v-if="clicks.today !== clicks.total && !clicks.loading" :value="clicks.total">کل صلوات ها: </Counter>
        <Counter :value="clicks.today" v-if="!clicks.loading">صلوات های امروز: </Counter>
        <!-- A Counter isn't really needed as this number always goes up in small increments -->
        <p>صلوات های تو: {{ clicks.you.toLocaleString("fa-IR") }}</p>
      </div>
      <ShareButton />
    </div>
    <Footer />
  </main>
</template>
