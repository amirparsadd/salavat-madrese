<script setup lang="ts">
  import { computed } from 'vue'
  import { useStats } from './queries/stats'
  import { selectedProvince } from './state/province'
  import { you } from './state/you'
  import { PROVINCES } from './provinces'
  import Counter from './component/Counter.vue'
  import Footer from './component/Footer.vue'
  import ShareButton from './component/ShareButton.vue'
  import OfflineIndicator from './component/OfflineIndicator.vue'
  import PrayButton from './component/PrayButton.vue'
  import ProvinceSelect from './component/ProvinceSelect.vue'
  import ProvinceLeaderboard from './component/ProvinceLeaderboard.vue'
  import UpdatePrompt from './component/UpdatePrompt.vue'

  const { data: stats } = useStats()

  const total = computed(() => stats.value?.total ?? 0)
  const today = computed(() => stats.value?.daily.amount ?? 0)
  const provinceName = computed(() => PROVINCES.find(province => province.id === selectedProvince.value)?.name)
  const provinceTotal = computed(() => stats.value?.provinces[selectedProvince.value] ?? 0)
</script>

<template>
  <main class="w-screen h-dvh bg-base-100 text-base-content flex flex-col items-center justify-center p-4">
    <OfflineIndicator />
    <UpdatePrompt />
    <div class="flex-1 flex flex-col items-center justify-center">
      <h1 class="text-3xl font-bold">صلوات مدرسه</h1>
      <p>اینجا میتونی همراه با سایر دانش آموزان ایران بشینی و برای تعطیلی مدارس صلوات بفرستی :)</p>
      <PrayButton />
      <div>
        <h2 class="flex gap-1 text-xl font-semibold">
          <span>آمار و ارقام</span>
          <img src="/barchart.png" alt="تصویر آمار" width="24px" height="24px">
        </h2>
        <Counter v-if="stats && today !== total" :value="total">کل صلوات ها: </Counter>
        <Counter v-if="stats" :value="today">صلوات های امروز: </Counter>
        <!-- A Counter isn't really needed as this number always goes up in small increments -->
        <p>صلوات های تو: {{ you.toLocaleString("fa-IR") }}</p>
        <p v-if="provinceName">صلوات های استان {{ provinceName }}: {{ provinceTotal.toLocaleString("fa-IR") }}</p>
        <div class="flex gap-2 mt-2 items-center">
          <ProvinceSelect />
          <ProvinceLeaderboard :province-clicks="stats?.provinces ?? {}" />
        </div>
      </div>
      <ShareButton />
    </div>
    <Footer />
  </main>
</template>
