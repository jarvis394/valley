import { useForm, getFormProps } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '../../utils/invariant'
import { type ActionFunctionArgs, redirect } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import { data } from '@remix-run/node'
import { ServerOnly } from 'remix-utils/server-only'
import { z } from 'zod'
import {
  useHints,
  useOptionalHints,
} from '../../components/ClientHints/ClientHints'
import {
  useOptionalRequestInfo,
  useRequestInfo,
} from '../../utils/request-info'
import { type Theme, setTheme } from '../../utils/theme'
import React from 'react'
import Button from '@valley/ui/Button'

const ThemeFormSchema = z.object({
  theme: z.enum(['system', 'light', 'dark']),
  redirectTo: z.string().optional(),
})

export const themeFetcherKey = 'theme-switch-fetcher'

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const submission = parseWithZod(formData, {
    schema: ThemeFormSchema,
  })

  invariantResponse(submission.status === 'success', 'Invalid theme received')

  const { theme, redirectTo } = submission.value
  const responseInit = {
    headers: { 'set-cookie': setTheme(theme) },
  }

  if (redirectTo) {
    return redirect(redirectTo, responseInit)
  } else {
    return data({ result: submission.reply() }, responseInit)
  }
}

export const ThemeSwitch: React.FC<{
  userPreference?: Theme | null
}> = ({ userPreference }) => {
  const fetcher = useFetcher<typeof action>({ key: themeFetcherKey })
  const requestInfo = useRequestInfo()
  const optimisticMode = useOptimisticThemeMode()
  const [form] = useForm({
    id: 'theme-switch',
    lastResult: fetcher.data?.result,
  })
  const mode = optimisticMode || userPreference || 'system'
  const nextMode =
    mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system'
  const modeLabel = {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  }

  return (
    <fetcher.Form
      {...getFormProps(form)}
      method="POST"
      action="/resources/theme-switch"
    >
      <ServerOnly>
        {() => (
          <input type="hidden" name="redirectTo" value={requestInfo.path} />
        )}
      </ServerOnly>
      <input type="hidden" name="theme" value={nextMode} />
      <Button type="submit">{modeLabel[mode]}</Button>
    </fetcher.Form>
  )
}

/**
 * If the user's changing their theme mode preference, this will return the
 * value it's being changed to.
 */
export function useOptimisticThemeMode(): Theme | 'system' | undefined {
  const fetchers = useFetcher({ key: themeFetcherKey })

  if (fetchers && fetchers.formData) {
    const submission = parseWithZod(fetchers.formData, {
      schema: ThemeFormSchema,
    })

    if (submission.status === 'success') {
      return submission.value.theme
    }

    return
  }

  return
}

/**
 * @returns the user's theme preference, or the client hint theme if the user
 * has not set a preference.
 */
export function useTheme(): Theme {
  const hints = useHints()
  const requestInfo = useRequestInfo()
  const optimisticMode = useOptimisticThemeMode()
  if (optimisticMode) {
    return optimisticMode === 'system' ? hints.theme : optimisticMode
  }
  return requestInfo.userSettings.theme ?? hints.theme
}

export function useOptionalTheme() {
  const optionalHints = useOptionalHints()
  const optionalRequestInfo = useOptionalRequestInfo()
  const optimisticMode = useOptimisticThemeMode()
  if (optimisticMode) {
    return optimisticMode === 'system' ? optionalHints?.theme : optimisticMode
  }
  return optionalRequestInfo?.userSettings.theme ?? optionalHints?.theme
}
