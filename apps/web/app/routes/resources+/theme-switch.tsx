import {
  useHints,
  useOptionalHints,
} from '../../components/ClientHints/ClientHints'
import {
  useOptionalRequestInfo,
  useRequestInfo,
} from '../../utils/request-info'
import { setTheme as getThemeCookie } from '../../utils/theme'
import React from 'react'
import Button from '@valley/ui/Button'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { Theme } from '@valley/shared'

type ThemeStoreState = {
  theme: Theme | null
}
type ThemeStoreActions = {
  setTheme: (data: ThemeStoreState['theme']) => void
}

export const useThemeStore = create<ThemeStoreState & ThemeStoreActions>()(
  immer((set) => ({
    theme: null,
    setTheme: (theme) =>
      set((state) => {
        const themeCookie = getThemeCookie(theme || Theme.SYSTEM)
        document.cookie = themeCookie
        state.theme = theme
        return state
      }),
  }))
)

export const ThemeSwitch: React.FC<{
  userPreference?: Theme | null
}> = ({ userPreference }) => {
  const theme = useThemeStore((store) => store.theme)
  const setTheme = useThemeStore((store) => store.setTheme)
  const mode: Theme = theme || userPreference || Theme.SYSTEM
  const nextMode: Theme =
    mode === Theme.SYSTEM
      ? Theme.LIGHT
      : mode === Theme.LIGHT
        ? Theme.DARK
        : Theme.SYSTEM
  const modeLabel: Record<Theme, string> = {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  }

  const handleThemeSwitch = () => {
    setTheme(nextMode)
  }

  return <Button onClick={handleThemeSwitch}>{modeLabel[mode]}</Button>
}

type ResolvedTheme = Exclude<Theme, Theme.SYSTEM>

/**
 * @returns the user's theme preference, or the client hint theme if the user
 * has not set a preference.
 */
export function useTheme(): ResolvedTheme {
  const hints = useHints()
  const requestInfo = useRequestInfo()
  const theme = useThemeStore((store) => store.theme)

  // Theme can be present in store when user changed it while app is running
  if (theme) {
    return theme === Theme.SYSTEM ? (hints.theme as ResolvedTheme) : theme
  }

  // Theme should not be present on first load
  return (
    (requestInfo.userSettings.theme as ResolvedTheme) ??
    (hints.theme as ResolvedTheme)
  )
}

export function useOptionalTheme(): ResolvedTheme {
  const optionalHints = useOptionalHints()
  const optionalRequestInfo = useOptionalRequestInfo()
  const theme = useThemeStore((store) => store.theme)

  if (theme) {
    return theme === Theme.SYSTEM
      ? (optionalHints?.theme as ResolvedTheme)
      : theme
  }

  // Request info could not be present if app has errored
  return (
    (optionalRequestInfo?.userSettings.theme as ResolvedTheme) ??
    (optionalHints?.theme as ResolvedTheme)
  )
}
