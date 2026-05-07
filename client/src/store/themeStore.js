import { create } from 'zustand'

const saved = localStorage.getItem('theme') || 'dark'
if (saved === 'light') document.documentElement.classList.add('light')

const useThemeStore = create((set) => ({
  theme: saved,
  toggle: () => set((state) => {
    const next = state.theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', next)
    if (next === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
    return { theme: next }
  })
}))

export default useThemeStore