export default defineNuxtRouteMiddleware(() => {
  if (!import.meta.client) {
    return
  }

  if (!useDonationForm().value) {
    return navigateTo('/', { replace: true })
  }
})
