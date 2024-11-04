import {
  ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { useIsPending } from '../../../utils/misc'
import { requireOnboardingData } from './onboarding.server'
import styles from '../auth.module.css'
import Stack from '@valley/ui/Stack'
import TextField from '@valley/ui/TextField'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import z from 'zod'
import { EmailSchema, PasswordSchema } from '../../../utils/user-validation'
import Button from '@valley/ui/Button'
import { ArrowRight } from 'geist-ui-icons'

const SecurityFormSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
})

export async function loader({ request }: LoaderFunctionArgs) {
  const data = await requireOnboardingData(request)
  return json(data)
}

export async function action({ request }: ActionFunctionArgs) {
  await requireOnboardingData(request)
  // const url = new URL(request.url)
  // const formData = await request.formData()

  // const onboardingSession = await onboardingSessionStorage.getSession(
  //   request.headers.get('cookie')
  // )

  // onboardingSession.set(onboardingStepKey, 'details')
  // url.pathname = '/auth/onboarding/details'

  // return redirect(url.toString())
  return json({})
}

export const meta: MetaFunction = () => {
  return [{ title: 'Onboarding | Valley' }]
}

export default function OnboardingSecurityRoute() {
  const data = useLoaderData<typeof loader>()
  const isPending = useIsPending()
  const [form, fields] = useForm({
    id: 'onboarding-provider-form',
    constraint: getZodConstraint(SecurityFormSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SecurityFormSchema })
    },
    lastResult: data.submission,
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  })

  return (
    <main className={styles.auth__content}>
      <h1 className={styles.auth__contentHeader}>Create your Valley account</h1>
      <Stack asChild gap={4} direction={'column'} fullWidth>
        <Form {...getFormProps(form)} method="post" viewTransition>
          <TextField
            {...getInputProps(fields.email, {
              type: 'email',
            })}
            label="This is your primary email address"
            size="lg"
            id="onboarding-email-input"
            readOnly
            disabled
          />
          <TextField
            {...getInputProps(fields.password, {
              type: 'password',
            })}
            required
            fieldState={fields.password}
            helperText="Your password must contain 8 or more characters"
            size="lg"
            id="onboarding-password-input"
          />
          <Button
            disabled={isPending}
            loading={isPending}
            fullWidth
            size="lg"
            after={<ArrowRight />}
          >
            Continue
          </Button>
        </Form>
      </Stack>
    </main>
  )
}
