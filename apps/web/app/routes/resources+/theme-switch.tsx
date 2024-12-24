import {
  useHints,
  useOptionalHints,
} from '../../components/ClientHints/ClientHints'
import {
  useOptionalRequestInfo,
  useRequestInfo,
} from '../../utils/request-info'
import { type Theme, setTheme as getThemeCookie } from '../../utils/theme'
import React from 'react'
import Button from '@valley/ui/Button'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export const config = { runtime: 'edge' }

export const themeFetcherKey = 'theme-switch-fetcher'

type ThemeStoreState = {
  theme: Theme | 'system' | null
}
type ThemeStoreActions = {
  setTheme: (data: ThemeStoreState['theme']) => void
}

export const useThemeStore = create<ThemeStoreState & ThemeStoreActions>()(
  immer((set) => ({
    theme: null,
    setTheme: (theme) =>
      set((state) => {
        const themeCookie = getThemeCookie(theme || 'system')
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
  const mode = theme || userPreference || 'system'
  const nextMode =
    mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system'
  const modeLabel = {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  }

  const handleThemeSwitch = () => {
    setTheme(nextMode)
  }

  return <Button onClick={handleThemeSwitch}>{modeLabel[mode]}</Button>
}

/**
 * @returns the user's theme preference, or the client hint theme if the user
 * has not set a preference.
 */
export function useTheme(): Theme {
  const hints = useHints()
  const requestInfo = useRequestInfo()
  const theme = useThemeStore((store) => store.theme)

  // Theme can be present in store when user changed it while app is running
  if (theme) {
    return theme === 'system' ? hints.theme : theme
  }

  // Theme should not be present on first load
  return requestInfo.userSettings.theme ?? hints.theme
}

export function useOptionalTheme() {
  const optionalHints = useOptionalHints()
  const optionalRequestInfo = useOptionalRequestInfo()
  const theme = useThemeStore((store) => store.theme)

  if (theme) {
    return theme === 'system' ? optionalHints?.theme : theme
  }

  // Request info could not be present if app has errored
  return optionalRequestInfo?.userSettings.theme ?? optionalHints?.theme
}
