import { useEffect, useMemo } from "react"
import { useMedia } from "react-use"

export declare type ColorScheme = "dark" | "light" | "auto"

const colorSchemeAtom = atomWithStorage<ColorScheme>("color-scheme", "auto")

function syncThemeColor(isDark: boolean) {
  const metaThemeColor = document.querySelector('meta[name="theme-color"]:not([media])')
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", isDark ? "#111827" : "#F14D42")
  }
}

export function useDark() {
  const [colorScheme, setColorScheme] = useAtom(colorSchemeAtom)
  const prefersDarkMode = useMedia("(prefers-color-scheme: dark)")
  const isDark = useMemo(() => colorScheme === "auto" ? prefersDarkMode : colorScheme === "dark", [colorScheme, prefersDarkMode])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
    syncThemeColor(isDark)
  }, [isDark])

  const setDark = (value: ColorScheme) => {
    setColorScheme(value)
  }

  const toggleDark = () => {
    setColorScheme(isDark ? "light" : "dark")
  }

  return { isDark, setDark, toggleDark }
}
