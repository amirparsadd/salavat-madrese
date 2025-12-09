<script setup lang="ts">
  import { useToast } from "vue-toastification"
  import ShareIcon from "../assets/share.svg"
  
  const toast = useToast()

  function share() {
    if("share" in navigator) {
      try {
        navigator.share({
          text: "بیا اینجا بشین واسه تعطیلی مدارس صلوات بفرست!",
          url: window.location.toString()
        })
      } catch (error) {
        console.error("Error when sharing:", error)
        toast.error("متاسفانه نتونستیم این حرکتو بزنیم!")
      }
    } else {
      toast.error("متاسفانه مرورگرت از اشتراک گذاری پشتیبانی نمیکنه!")
    }
  }
</script>

<template>
  <button class="btn btn-primary mt-2" @click="share()">
    <span>
      بفرست واسه دوستات
    </span>
    <ShareIcon />
  </button>
</template>