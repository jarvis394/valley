import { redirect, Form, useNavigation } from 'react-router'
import { useIsPending } from '../../../utils/misc'
import { requireOnboardingData } from './onboarding.server'
import styles from '../auth.module.css'
import onboardingStyles from './onboarding.module.css'
import Button from '@valley/ui/Button'
import {
  INTERFACE_LANGUAGES,
  INTERFACE_LANGUAGES_NAMES,
  InterfaceLanguagesSchema,
} from '../../../config/language'
import { ChevronRight } from 'geist-ui-icons'
import Stack from '@valley/ui/Stack'
import { redirectWithToast } from '../../../server/toast.server'
import { onboardingSessionStorage } from 'app/server/auth/onboarding.server'
import { Route } from './+types/language-select'

export const interfaceLanguageKey = 'interfaceLanguage'

export async function loader({ request }: Route.LoaderArgs) {
  const data = await requireOnboardingData(request)
  return data
}

export async function action({ request }: Route.ActionArgs) {
  await requireOnboardingData(request)
  const url = new URL(request.url)
  const formData = await request.formData()
  const selectedInterfaceLanguage = formData.get(interfaceLanguageKey)
  const parsedLanguageResult = InterfaceLanguagesSchema.safeParse(
    selectedInterfaceLanguage
  )

  const onboardingSession = await onboardingSessionStorage.getSession(
    request.headers.get('cookie')
  )

  if (!parsedLanguageResult.success) {
    return redirectWithToast(url.toString(), {
      description: 'Invalid interface language',
      title: 'Error',
      type: 'error',
    })
  }

  onboardingSession.set('onboardingStep', 'security')
  onboardingSession.set(interfaceLanguageKey, parsedLanguageResult.data)
  url.pathname = '/auth/onboarding/security'

  return redirect(url.toString(), {
    headers: {
      'set-cookie':
        await onboardingSessionStorage.commitSession(onboardingSession),
    },
  })
}

export const meta: Route.MetaFunction = () => {
  return [{ title: 'Onboarding | Valley' }]
}

const OnboardingLanguageSelectRoute: React.FC<Route.ComponentProps> = () => {
  const isPending = useIsPending()
  const navigation = useNavigation()
  const selectedInterfaceLanguage =
    navigation.formData?.get(interfaceLanguageKey)

  return (
    <main className={styles.auth__content}>
      <h1 className={styles.auth__contentHeader}>Choose interface language</h1>
      <Stack asChild gap={2} direction={'column'} fullWidth>
        <Form method="post" viewTransition>
          {INTERFACE_LANGUAGES.map((language) => (
            <Button
              variant="tertiary"
              className={onboardingStyles.onboarding__selectButton}
              size="lg"
              name={interfaceLanguageKey}
              value={language}
              fullWidth
              align="start"
              key={language}
              type="submit"
              after={<ChevronRight />}
              disabled={isPending && selectedInterfaceLanguage === language}
            >
              {INTERFACE_LANGUAGES_NAMES[language]}
            </Button>
          ))}
        </Form>
      </Stack>
    </main>
  )
}

export default OnboardingLanguageSelectRoute
