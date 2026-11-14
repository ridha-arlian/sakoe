import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import { useAnonymousName } from '@/composables/useAnonymousName'

describe('useAnonymousName', () => {
  it('stashes and restores the typed name', async () => {
    const name = ref('Alice')
    const anonymous = ref(false)

    useAnonymousName(name, anonymous)

    anonymous.value = true
    await nextTick()
    expect(name.value).toBe('Anonymous')

    anonymous.value = false
    await nextTick()
    expect(name.value).toBe('Alice')
  })

  it('restores an empty name', async () => {
    const name = ref('')
    const anonymous = ref(false)

    useAnonymousName(name, anonymous)

    anonymous.value = true
    await nextTick()
    expect(name.value).toBe('Anonymous')

    anonymous.value = false
    await nextTick()
    expect(name.value).toBe('')
  })

  it('does not stash the placeholder as the real name on a second toggle', async () => {
    const name = ref('Alice')
    const anonymous = ref(false)

    useAnonymousName(name, anonymous)

    anonymous.value = true
    await nextTick()
    anonymous.value = false
    await nextTick()
    anonymous.value = true
    await nextTick()
    anonymous.value = false
    await nextTick()

    expect(name.value).toBe('Alice')
  })
})
