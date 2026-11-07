import { ref, watch } from "vue"

const LOCAL_STORAGE_KEY = "clicks"

export const you = ref(parseInt(localStorage.getItem(LOCAL_STORAGE_KEY) ?? "0"))

watch(you, (value) => localStorage.setItem(LOCAL_STORAGE_KEY, String(value)))
