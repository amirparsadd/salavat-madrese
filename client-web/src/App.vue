<script setup lang="ts">
  import { onMounted, ref } from 'vue';

  const REFETCH_INTERVAL = 2 * 1000 // 2 Seconds

  // Update when developing - used on the main salavat madrese website
  const API_ENDPOINT = "https://back.amir-parsa.ir"

  let total = ref(0);
  let today = ref(0);
  let loading = ref(true);
  let interval = ref<number | null>(null);

  async function fetchFreshData() {
    const req = await fetch(API_ENDPOINT + "/")
    const data = await req.json()

    total.value = data.total
    today.value = data.daily.amount
    loading.value = false
  }

  async function click() {
    today.value++
    total.value++
    const req = await fetch(API_ENDPOINT + "/click", { method: "POST" })

    if(req.status === 429) {
      today.value--
      total.value--
      setTimeout(() => alert("خیلی تند تند صلوات میفرستیا، یکم آروم تر"), 10)
      return
    }

    if(interval.value) {
      clearInterval(interval.value)
      interval.value = setInterval(fetchFreshData, REFETCH_INTERVAL)
    }
  }

  onMounted(() => {
    fetchFreshData()
    interval.value = setInterval(fetchFreshData, REFETCH_INTERVAL)
  })
</script>

<template>
  <main class="w-screen h-[100dvh] bg-slate-200 flex flex-col items-center justify-center p-4">
    <div class="flex-1 flex flex-col items-center justify-center">
      <h1 class="text-3xl font-bold">صلوات مدرسه</h1>
      <p>اینجا میتونی همراه با سایر دانش آموزان ایران بشینی و برای تعطیلی مدارس صلوات بفرستی :)</p>
      <button @click="click()" class="m-4 p-8 rounded-full cursor-pointer hover:opacity-90 active:scale-110 border border-slate-300 bg-slate-50">
        <img src="/pray.png" alt="دکمه صلوات" width="64px" height="64px">
      </button>
      <div v-if="loading === false">
        <h2 class="flex gap-1 text-xl font-semibold">
          <span>آمار و ارقام</span>
          <img src="/barchart.png" alt="تصویر آمار" width="24px" height="24px">
        </h2>
        <p>کل صلوات ها: {{ total }}</p>
        <p>صلوات های امروز: {{ today }}</p>
      </div>
    </div>
    <footer class="flex flex-col items-center justify-center">
      <p class="text-xs font-extralight mt-12">فقط لطفا قبل ضربه زدن بر روی صلوات شمار واقعا صلوات بفرستید تا زحماتمون بیهوده نباشه</p>
      <div class="text-sm mt-1 text-blue-500 hover:text-blue-500/80 font-bold flex gap-4">
        <a href="https://t.me/amirparsab90">پشتیبانی</a>
        <a href="https://uptimekuma.afrachin.ir/status/salavat-madrese">وضعیت سرویس</a>
      </div>
    </footer>
  </main>
</template>
