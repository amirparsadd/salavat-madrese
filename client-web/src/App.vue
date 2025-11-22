<script setup lang="ts">
  import { onMounted } from 'vue';
  import { configs } from './state/configs';
  import { clicks } from './state/clicks';
  import { interval } from './state/interval';

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
      <button @click="clicks.click()" class="m-4 p-8 rounded-full cursor-pointer hover:opacity-90 active:scale-110 border border-slate-300 bg-slate-50">
        <img src="/pray.png" alt="دکمه صلوات" width="64px" height="64px">
      </button>
      <div v-if="!clicks.loading">
        <h2 class="flex gap-1 text-xl font-semibold">
          <span>آمار و ارقام</span>
          <img src="/barchart.png" alt="تصویر آمار" width="24px" height="24px">
        </h2>
        <p>کل صلوات ها: {{ clicks.total }}</p>
        <p>صلوات های امروز: {{ clicks.today }}</p>
      </div>
    </div>
    <footer class="flex flex-col items-center justify-center">
      <p class="text-xs font-extralight mt-12">فقط لطفا قبل ضربه زدن بر روی صلوات شمار واقعا صلوات بفرستید تا زحماتمون بیهوده نباشه</p>
      <div class="text-sm mt-1 text-blue-500 font-bold flex gap-4">
        <a class="hover:text-blue-500/80" :href="configs?.value['support'] || 'https://t.me/amirparsab90'">پشتیبانی</a>
        <a class="hover:text-blue-500/80" :href="configs?.value['servicestatus'] || 'https://uptimekuma.afrachin.ir/status/salavat-madrese'">وضعیت سرویس</a>
      </div>
    </footer>
  </main>
</template>
