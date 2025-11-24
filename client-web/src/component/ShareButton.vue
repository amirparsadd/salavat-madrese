<script setup lang="ts">
  import ShareIcon from "../assets/share.svg"
  
  function share() {
    if("share" in navigator) {
      try {
        navigator.share({
          text: "بیا اینجا بشین واسه تعطیلی مدارس صلوات بفرست!",
          url: window.location.toString()
        })
      } catch (error) {
        console.error("Error when sharing:", error)
        alert("متاسفانه نتونستیم این حرکتو بزنیم!")
      }
    } else {
      alert("متاسفانه مرورگرت از اشتراک گذاری پشتیبانی نمیکنه!")
    }
  }
</script>

<template>
  <button class="mt-3 bg-blue-300 flex items-center justify-center gap-2 p-2 rounded-md shadow-xs cursor-pointer hover:opacity-85 border border-slate-300/75" @click="share()">
    <span>
      بفرست واسه دوستات
    </span>
    <ShareIcon />
  </button>
</template>