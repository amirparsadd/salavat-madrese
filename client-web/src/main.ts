import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import Toast from "vue-toastification"
import "vue-toastification/dist/index.css"

const app = createApp(App)

app.use(Toast)

app.mount('#app')

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js') 
      console.log('Service Worker registered:', registration)
    } catch (error) {
      console.log('Service Worker registration failed:', error)
    }
  })
}