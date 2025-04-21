import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { data, Form, Link, useSearchParams } from 'react-router'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { GeneralErrorBoundary } from 'app/components/ErrorBoundary'
import AuthFormHeader from 'app/components/AuthFormHeader/AuthFormHeader'
import { useIsPending } from 'app/utils/misc'
import OTPInput from '@valley/ui/OTPInput'
import Button from '@valley/ui/Button'
import styles from '../auth.module.css'
import { ArrowLeft } from 'geist-ui-icons'
import { useCountdown } from 'usehooks-ts'
import React, { useEffect, useState } from 'react'
import { showToast } from '@valley/ui/Toast'
import { auth } from '@valley/auth'
import {
  getValidatedFormData,
  RemixFormProvider,
  useRemixForm,
} from 'remix-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { checkHoneypot } from 'app/server/honeypot.server'
import { Controller, FieldErrors } from 'react-hook-form'
import { redirectWithToast } from 'app/server/toast.server'
import { handleVerification as handleOnboardingVerification } from '../onboarding+/onboarding.server'
import {
  targetKey,
  redirectToKey,
  codeKey,
  typeKey,
} from 'app/config/paramsKeys'
import { Route } from './+types'

export const handle: SEOHandle = {
  getSitemapEntries: () => null,
}

export const TOTP_RESEND_TIMEOUT = 30

const types = [
  'auth',
  'onboarding',
  'reset-password',
  'change-email',
  '2fa',
] as const
const VerificationTypeSchema = z.enum(types)
export type VerificationType = z.infer<typeof VerificationTypeSchema>
export const VerifySchema = z.object({
  [codeKey]: z.string().length(6),
  [typeKey]: VerificationTypeSchema,
  [targetKey]: z.string(),
  [redirectToKey]: z.string().optional(),
})

type FormData = z.infer<typeof VerifySchema>

const resolver = zodResolver(VerifySchema)

export async function action({ request }: Route.ActionArgs) {
  const {
    errors,
    data: submissionData,
    receivedValues,
  } = await getValidatedFormData<FormData>(request, resolver)

  checkHoneypot(receivedValues)

  if (errors) {
    return data(
      { errors },
      {
        status: 400,
      }
    )
  }

  const response = await auth.api.signInEmailOTP({
    body: {
      email: submissionData[targetKey],
      otp: submissionData[codeKey],
    },
    headers: request.headers,
    asResponse: true,
    returnHeaders: true,
  })

  if (response.ok) {
    switch (submissionData[typeKey]) {
      case 'auth':
        return response
      case 'onboarding':
        return await handleOnboardingVerification({
          target: submissionData[targetKey],
          headers: response.headers,
        })
      default:
        return await redirectWithToast('/auth/login', {
          title: 'Not Implemented',
          type: 'error',
          description: 'This function was not implemented on backend',
        })
    }
  } else {
    return response
  }
}

const VerifyRoute: React.FC<Route.ComponentProps> = ({ actionData }) => {
  const [searchParams] = useSearchParams()
  const [didResendVerificationCode, setDidResendVerificationCode] =
    useState(false)
  const isPending = useIsPending()
  const parseWithZodType = VerificationTypeSchema.safeParse(
    searchParams.get(typeKey)
  )
  const [count, { startCountdown, stopCountdown }] = useCountdown({
    countStart: TOTP_RESEND_TIMEOUT,
  })
  const target = searchParams.get(targetKey) || undefined
  const type = parseWithZodType.success ? parseWithZodType.data : '2fa'
  const methods = useRemixForm<FormData>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver,
    defaultValues: {
      code: searchParams.get(codeKey) || undefined,
      redirectTo: searchParams.get(redirectToKey) || undefined,
      type,
      target,
    },
    submitConfig: { viewTransition: true },
    errors: actionData?.errors as FieldErrors<FormData>,
  })

  const isResendButtonDisabled = count !== 0 || didResendVerificationCode

  const handleCodeResend: React.MouseEventHandler = (e) => {
    e.preventDefault()
    stopCountdown()
    setDidResendVerificationCode(true)
  }

  useEffect(() => {
    startCountdown()
  }, [startCountdown])

  useEffect(() => {
    if (actionData && 'code' in actionData) {
      let description = 'Unexpected error'
      switch (actionData.code) {
        case 'INVALID_OTP':
          description = 'Invalid code'
          break
        case 'OTP_EXPIRED':
          description = 'Verification has expired, try to authenticate again'
          break
      }

      showToast({
        description,
        type: 'error',
        id: 'verify-code',
      })
    }
  }, [actionData])

  return (
    <main className={styles.auth__content}>
      <AuthFormHeader type={type} email={target} />
      <RemixFormProvider {...methods}>
        <Form
          onSubmit={methods.handleSubmit}
          method="POST"
          viewTransition
          className={styles.auth__form}
        >
          <HoneypotInputs />
          <Controller
            control={methods.control}
            name={codeKey}
            render={({ field, fieldState }) => (
              <OTPInput
                inputProps={{
                  ...field,
                  autoComplete: 'one-time-code',
                  autoFocus: true,
                  autoCorrect: 'false',
                }}
                errors={[fieldState.error?.message]}
              />
            )}
          />
          <input {...methods.register(typeKey)} hidden />
          <input {...methods.register(targetKey)} hidden />
          <input {...methods.register(redirectToKey)} hidden />
          <Button
            variant={count === 0 ? 'tertiary' : 'tertiary-dimmed'}
            disabled={isResendButtonDisabled}
            size="sm"
            type="button"
            onClick={handleCodeResend}
          >
            {didResendVerificationCode && 'A new code has been sent'}
            {!didResendVerificationCode &&
              `Didn't recieve a code? Resend${
                count === 0 ? '' : ` (${count})`
              }`}
          </Button>
          <Button
            fullWidth
            variant="primary"
            type="submit"
            size="lg"
            loading={isPending}
            disabled={isPending}
            style={{ viewTransitionName: 'auth-form-submit' }}
          >
            Submit
          </Button>
          <Button
            asChild
            variant="tertiary-dimmed"
            before={<ArrowLeft />}
            size="md"
          >
            {type === 'onboarding' ? (
              <Link to="/auth/register" viewTransition>
                Back to Sign Up options
              </Link>
            ) : (
              <Link to="/auth/login" viewTransition>
                Back to Login options
              </Link>
            )}
          </Button>
        </Form>
      </RemixFormProvider>
    </main>
  )
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />
}

export default VerifyRoute
