import {
  type HeadersFunction,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
  data,
} from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { looseOptional, useIsPending } from '../../../utils/misc'
import { requireOnboardingData } from './onboarding.server'
import styles from '../auth.module.css'
import Button from '@valley/ui/Button'
import Stack from '@valley/ui/Stack'
import { onboardingSessionStorage } from 'app/server/auth/onboarding.server'
import { getValidatedFormData, useRemixForm } from 'remix-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { NameSchema, PhoneSchema } from '../../../utils/user-validation'
import TextField from '@valley/ui/TextField'
import { Controller } from 'react-hook-form'
import PhoneInput from 'react-phone-number-input/input'
import { verifySessionStorage } from 'app/server/auth/verification.server'
import { prisma } from 'app/server/db.server'
import { redirectWithToast } from 'app/server/toast.server'
import { register } from 'app/server/auth/auth.server'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { authSessionStorage } from 'app/server/auth/session.server'

const DetailsFormSchema = z.object({
  firstName: NameSchema,
  lastName: looseOptional(NameSchema),
  phone: looseOptional(PhoneSchema),
})

type FormData = z.infer<typeof DetailsFormSchema>

const resolver = zodResolver(DetailsFormSchema)

export async function loader({ request }: LoaderFunctionArgs) {
  const data = await requireOnboardingData(request)
  return data
}

export const headers: HeadersFunction = ({ actionHeaders }) => {
  return actionHeaders
}

export async function action({ request }: ActionFunctionArgs) {
  const { submission } = await requireOnboardingData(request)
  const {
    errors,
    data: submissionData,
    receivedValues: defaultValues,
  } = await getValidatedFormData<FormData>(request, resolver)
  if (errors) {
    return data(
      { errors, defaultValues },
      {
        status: 400,
      }
    )
  }
  const url = new URL(request.url)
  const redirectTo = url.searchParams.get('redirectTo')

  const headers = new Headers()
  const onboardingSession = await onboardingSessionStorage.getSession(
    request.headers.get('cookie')
  )
  const verifySession = await verifySessionStorage.getSession(
    request.headers.get('cookie')
  )

  const providerName = onboardingSession.get('provider')

  onboardingSession.set('firstName', submissionData.firstName)
  submissionData.lastName &&
    onboardingSession.set('lastName', submissionData.lastName)
  submissionData.phone && onboardingSession.set('phone', submissionData.phone)

  headers.append(
    'set-cookie',
    await onboardingSessionStorage.commitSession(onboardingSession)
  )

  const existingUser = await prisma.user.findUnique({
    where: { email: submission.data.email },
    select: { id: true },
  })

  if (existingUser) {
    return redirectWithToast(
      request.url.toString(),
      {
        type: 'error',
        description: 'A user already exists with this email',
      },
      { headers }
    )
  }

  const session = await register({
    email: submission.data.email,
    password: submission.data.usePassword
      ? submission.data.password
      : undefined,
    connection:
      providerName && submission.prefilledProfile?.id
        ? {
            providerId: submission.prefilledProfile?.id,
            providerName,
          }
        : undefined,
    fullname: [submissionData.firstName, submissionData.lastName]
      .filter(Boolean)
      .join(' '),
  })

  const authSession = await authSessionStorage.getSession(
    request.headers.get('cookie')
  )
  authSession.set('sessionId', session.id)
  authSession.set('userId', session.userId)

  headers.append(
    'set-cookie',
    await authSessionStorage.commitSession(authSession, {
      expires: session.expirationDate,
    })
  )
  headers.append(
    'set-cookie',
    await verifySessionStorage.destroySession(verifySession)
  )
  headers.append(
    'set-cookie',
    await onboardingSessionStorage.destroySession(onboardingSession)
  )

  return redirectWithToast(
    safeRedirect(redirectTo || '/projects'),
    { description: 'You are now logged in', type: 'info' },
    { headers }
  )
}

export const meta: MetaFunction = () => {
  return [{ title: 'Onboarding | Valley' }]
}

export default function OnboardingDetailsRoute() {
  const data = useLoaderData<typeof loader>()
  const isPending = useIsPending()
  const prefilledFullName = data.submission.prefilledProfile?.name?.split(' ')
  const { handleSubmit, control, getFieldState, register, formState } =
    useRemixForm<FormData>({
      mode: 'all',
      reValidateMode: 'onChange',
      resolver,
      defaultValues: {
        ...data.submission.data,
        firstName: prefilledFullName?.slice(0, -1)?.join(' '),
        lastName: prefilledFullName?.slice(-1)[0],
      },
      submitConfig: {
        viewTransition: true,
      },
    })

  return (
    <main className={styles.auth__content}>
      <Stack gap={2} direction="column">
        <h1 className={styles.auth__contentHeader}>Fill in your details</h1>
        <p className={styles.auth__contentSubtitle}>
          Fill in your contacts so that
          <br />
          gallery visitors can contact you
        </p>
      </Stack>
      <Stack asChild gap={4} direction={'column'} fullWidth>
        <Form
          id="onboarding-details-form"
          onSubmit={handleSubmit}
          method="POST"
          viewTransition
        >
          <Stack gap={{ sm: 4, md: 2 }} direction={{ sm: 'column', md: 'row' }}>
            <TextField
              {...register('firstName')}
              fieldState={getFieldState('firstName', formState)}
              label="First name"
              required
              size="lg"
            />
            <TextField
              {...register('lastName')}
              fieldState={getFieldState('lastName', formState)}
              label="Last name"
              size="lg"
            />
          </Stack>
          <Controller
            control={control}
            name="phone"
            render={({ field, fieldState }) => (
              <PhoneInput
                smartCaret
                inputComponent={TextField}
                onChange={field.onChange}
                value={field.value}
                fieldState={fieldState}
                label="Phone number"
                placeholder="+7 (123) 123-45-67"
                size="lg"
              />
            )}
          />
        </Form>
      </Stack>
      <Stack fullWidth align="center" direction="column" gap={3}>
        <Button
          form="onboarding-details-form"
          type="submit"
          fullWidth
          size="lg"
          disabled={isPending}
          loading={isPending}
          style={{ viewTransitionName: 'onboarding-form-submit' }}
        >
          Submit
        </Button>
      </Stack>
    </main>
  )
}
