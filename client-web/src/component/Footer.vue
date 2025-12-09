<script setup lang="ts">
  import { configs } from '../state/configs';
</script>

<template>
  <footer class="flex flex-col items-center justify-center">
    <p class="text-xs font-extralight mt-12">فقط لطفا قبل ضربه زدن بر روی صلوات شمار واقعا صلوات بفرستید تا زحماتمون بیهوده نباشه</p>
    <div class="text-sm mt-1 text-blue-500 font-bold flex gap-4">
      <a class="link link-primary" :href="configs?.value['support'] || 'https://t.me/amirparsab90'">پشتیبانی</a>
      <a class="link link-primary" :href="configs?.value['servicestatus'] || 'https://uptimekuma.afrachin.ir/status/salavat-madrese'">وضعیت سرویس</a>
    </div>
  </footer>
</template>