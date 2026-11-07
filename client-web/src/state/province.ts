import { ref, watch } from "vue"

const LOCAL_STORAGE_KEY = "province"

export const selectedProvince = ref(localStorage.getItem(LOCAL_STORAGE_KEY) ?? "")

watch(selectedProvince, (value) => localStorage.setItem(LOCAL_STORAGE_KEY, value))
