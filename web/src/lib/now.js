import { onUnmounted, ref } from 'vue';

// re-evaluates running and past lectures every minute
export function useNow() {
  const now = ref(Date.now());
  const timer = setInterval(() => (now.value = Date.now()), 60 * 1000);
  onUnmounted(() => clearInterval(timer));
  return now;
}
