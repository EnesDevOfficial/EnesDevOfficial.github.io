const readBooted = () => {
  try {
    return sessionStorage.getItem('booted') === '1' || matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return true
  }
}

export const shouldBoot = !readBooted()

export const bootDelay = shouldBoot ? 1900 : 0

export const markBooted = () => {
  try {
    sessionStorage.setItem('booted', '1')
  } catch {}
}
