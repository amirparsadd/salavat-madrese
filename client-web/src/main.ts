import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import Toast from "vue-toastification"
import "vue-toastification/dist/index.css"
import { VueQueryPlugin } from "@tanstack/vue-query"

const app = createApp(App)

app.use(Toast)
app.use(VueQueryPlugin)

app.mount('#app')
