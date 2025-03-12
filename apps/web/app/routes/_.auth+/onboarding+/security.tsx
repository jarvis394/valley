import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect,
  data,
} from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { looseOptional, useIsPending } from '../../../utils/misc'
import { requireOnboardingData } from './onboarding.server'
import styles from '../auth.module.css'
import Stack from '@valley/ui/Stack'
import TextField from '@valley/ui/TextField'
import * as z from 'zod'
import {
  EmailSchema,
  PasswordSchema,
} from '../../../utils/user-validation'
import Button from '@valley/ui/Button'
import { ArrowRight } from 'geist-ui-icons'
import { useRemixForm, getValidatedFormData } from 'remix-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import FormCollapsibleField from '../../../components/FormCollapsibleField/FormCollapsibleField'
import FormHelperText from '@valley/ui/FormHelperText'
import PasswordField from '../../../components/PasswordField/PasswordField'
import { onboardingSessionStorage } from '../../../server/auth/onboarding.server'
import { PASSWORD_MIN_LENGTH } from '@valley/shared'

const SecurityFormSchema = z
  .object({
    email: EmailSchema,
    usePassword: z.boolean(),
    password: looseOptional(PasswordSchema),
  })
  .superRefine((values, context) => {
    if (values.usePassword && !values.password) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password cannot be empty',
        path: ['password'],
      })
    }
  })

type FormData = z.infer<typeof SecurityFormSchema>

const resolver = zodResolver(SecurityFormSchema)

export async function loader({ request }: LoaderFunctionArgs) {
  const data = await requireOnboardingData(request)
  return data
}

export async function action({ request }: ActionFunctionArgs) {
  await requireOnboardingData(request)
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
  const onboardingSession = await onboardingSessionStorage.getSession(
    request.headers.get('cookie')
  )

  onboardingSession.set('onboardingStep', 'details')
  onboardingSession.set('usePassword', submissionData.usePassword)
  if (submissionData.usePassword) {
    onboardingSession.set('password', submissionData.password)
  }

  url.pathname = '/auth/onboarding/details'

  return redirect(url.toString(), {
    headers: {
      'set-cookie': await onboardingSessionStorage.commitSession(
        onboardingSession
      ),
    },
  })
}

export const meta: MetaFunction = () => {
  return [{ title: 'Onboarding | Valley' }]
}

export default function OnboardingSecurityRoute() {
  const data = useLoaderData<typeof loader>()
  const isPending = useIsPending()
  const { handleSubmit, watch, getFieldState, register, formState } =
    useRemixForm<FormData>({
      mode: 'all',
      reValidateMode: 'onChange',
      resolver,
      defaultValues: data.submission.data,
      submitConfig: {
        viewTransition: true,
      },
    })
  const usePassword = watch('usePassword')

  return (
    <main className={styles.auth__content}>
      <h1 className={styles.auth__contentHeader}>Create your Valley account</h1>
      <Stack asChild gap={4} direction={'column'} fullWidth>
        <Form
          id="onboarding-security-form"
          onSubmit={handleSubmit}
          method="POST"
          viewTransition
        >
          <TextField
            type="email"
            label="This is your primary email address"
            size="lg"
            id="onboarding-email-input"
            readOnly
            disabled
            {...register('email')}
          />
          <Stack gap={0} direction={'column'}>
            <FormCollapsibleField
              label="Use password"
              id="onboarding-security-use-password"
              defaultState={usePassword ? 'expanded' : 'collapsed'}
              {...register('usePassword')}
            >
              <PasswordField
                size="lg"
                placeholder="Password"
                fieldState={getFieldState('password', formState)}
                helperText={`Your password must contain ${PASSWORD_MIN_LENGTH} or more characters`}
                validHelperText="Your password meets all requirements"
                {...register('password')}
              />
            </FormCollapsibleField>
            <FormHelperText animationKey={usePassword ? 'true' : 'false'}>
              {usePassword ? (
                <>
                  <span style={{ color: 'var(--blue-600)' }}>Tip:</span> you can
                  go password-less and only use magic links for login — just
                  uncheck the checkbox
                </>
              ) : (
                'You will be able to log in to Valley with magic links'
              )}
            </FormHelperText>
          </Stack>
        </Form>
      </Stack>
      <Button
        form="onboarding-security-form"
        disabled={isPending}
        loading={isPending}
        fullWidth
        size="lg"
        after={<ArrowRight />}
        style={{ viewTransitionName: 'onboarding-form-submit' }}
      >
        Continue
      </Button>
    </main>
  )
}
