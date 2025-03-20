import { Form, type MetaFunction, data } from 'react-router'
import {
  combineHeaders,
  looseOptional,
  useIsPending,
} from '../../../utils/misc'
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
import { redirectWithToast } from 'app/server/toast.server'
import { safeRedirect } from 'remix-utils/safe-redirect'
import React, { JSX } from 'react'
import { auth } from '@valley/auth'
import { db, userSettings } from '@valley/db'
import { Route } from './+types/details'

const DetailsFormSchema = z.object({
  firstName: NameSchema,
  lastName: looseOptional(NameSchema),
  phone: looseOptional(PhoneSchema),
})

type FormData = z.infer<typeof DetailsFormSchema>

const resolver = zodResolver(DetailsFormSchema)

export async function loader({ request }: Route.LoaderArgs) {
  const data = await requireOnboardingData(request)
  return data
}

export const headers = ({ actionHeaders }: Route.HeadersArgs) => {
  return actionHeaders
}

export async function action({ request }: Route.ActionArgs) {
  const { submission, userId } = await requireOnboardingData(request)
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

  onboardingSession.set('firstName', submissionData.firstName)
  submissionData.lastName &&
    onboardingSession.set('lastName', submissionData.lastName)
  submissionData.phone && onboardingSession.set('phone', submissionData.phone)

  headers.append(
    'set-cookie',
    await onboardingSessionStorage.commitSession(onboardingSession)
  )

  if (submission.data.usePassword && submission.data.password) {
    await auth.api.setPassword({
      body: {
        newPassword: submission.data.password,
      },
      headers: request.headers,
    })
  }

  const response = await auth.api.updateUser({
    body: {
      name: [submissionData.firstName, submissionData.lastName]
        .filter(Boolean)
        .join(' '),
      onboarded: true,
    },
    headers: request.headers,
    returnHeaders: true,
  })

  await db.insert(userSettings).values({
    userId,
    interfaceLanguage: submission.data.interfaceLanguage,
    phone: submissionData.phone,
  })

  headers.append(
    'set-cookie',
    await onboardingSessionStorage.destroySession(onboardingSession)
  )

  return redirectWithToast(
    safeRedirect(redirectTo || '/projects'),
    {
      title: 'Welcome to Valley',
      description: 'You are now logged in',
      type: 'info',
    },
    { headers: combineHeaders(headers, response.headers) }
  )
}

export const meta: MetaFunction = () => {
  return [{ title: 'Onboarding | Valley' }]
}

const OnboardingDetailsRoute: React.FC<Route.ComponentProps> = ({
  loaderData,
}) => {
  const isPending = useIsPending()
  const { handleSubmit, control, getFieldState, register, formState } =
    useRemixForm<FormData>({
      mode: 'all',
      reValidateMode: 'onChange',
      resolver,
      defaultValues: {
        ...loaderData.submission.data,
        ...loaderData.submission.prefilledProfile,
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
                // Shit typings that cannot accept React.memo
                inputComponent={TextField as unknown as () => JSX.Element}
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

export default OnboardingDetailsRoute
