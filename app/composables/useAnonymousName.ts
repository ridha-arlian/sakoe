import type { Ref } from 'vue'
import { watch } from 'vue'

export function useAnonymousName(name: Ref<string>, isAnonymous: Ref<boolean>): void {
  let stashed: string | null = null

  watch(isAnonymous, (anonymous) => {
    if (anonymous) {
      if (stashed === null) {
        stashed = name.value
      }

      name.value = 'Anonymous'
      return
    }

    if (stashed !== null) {
      name.value = stashed
      stashed = null
    }
  })
}
