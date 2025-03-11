import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { type ActionFunctionArgs } from '@remix-run/node'
import {
  data,
  Form,
  Link,
  useActionData,
  useSearchParams,
} from '@remix-run/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { GeneralErrorBoundary } from '../../../components/ErrorBoundary'
import AuthFormHeader from '../../../components/AuthFormHeader/AuthFormHeader'
import { useIsPending } from '../../../utils/misc'
import OTPInput from '@valley/ui/OTPInput'
import Button from '@valley/ui/Button'
import styles from '../auth.module.css'
import { ArrowLeft } from 'geist-ui-icons'
import { useCountdown } from 'usehooks-ts'
import React, { useEffect, useState } from 'react'
import { showToast } from '@valley/ui/Toast'
import { auth } from '@valley/auth'
import { getValidatedFormData, useRemixForm } from 'remix-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { checkHoneypot } from 'app/server/honeypot.server'
import { Controller, FieldErrors } from 'react-hook-form'
import { redirect } from '@remix-run/router'

export const handle: SEOHandle = {
  getSitemapEntries: () => null,
}

export const TOTP_RESEND_TIMEOUT = 30

export const targetKey = 'target'
export const verifyCodeKey = 'code'
export const verifyTypeKey = 'type'
export const redirectToKey = 'redirectTo'
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
  [verifyCodeKey]: z.string().length(6),
  [verifyTypeKey]: VerificationTypeSchema,
  [targetKey]: z.string(),
  [redirectToKey]: z.string().optional(),
})

type FormData = z.infer<typeof VerifySchema>

const resolver = zodResolver(VerifySchema)

export async function action({ request }: ActionFunctionArgs) {
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

  try {
    const result = await auth.api.signInEmailOTP({
      body: {
        email: submissionData[targetKey],
        otp: submissionData[verifyCodeKey],
      },
      headers: request.headers,
    })

    console.log(result)

    switch (submissionData[verifyTypeKey]) {
      case 'onboarding':
        return redirect('/home')
      default:
        return redirect('/home')
    }
  } catch (e) {
    return data(
      {
        errors: {
          code: {
            type: 'value',
            message: 'Invalid code',
          },
        } satisfies FieldErrors<FormData>,
      },
      {
        status: 400,
      }
    )
  }
}

export default function VerifyRoute() {
  const [searchParams] = useSearchParams()
  const [didResendVerificationCode, setDidResendVerificationCode] =
    useState(false)
  const isPending = useIsPending()
  const actionData = useActionData<typeof action>()
  const parseWithZodType = VerificationTypeSchema.safeParse(
    searchParams.get(verifyTypeKey)
  )
  const [count, { startCountdown, stopCountdown }] = useCountdown({
    countStart: TOTP_RESEND_TIMEOUT,
  })
  const target = searchParams.get(targetKey) || undefined
  const type = parseWithZodType.success ? parseWithZodType.data : '2fa'
  const { handleSubmit, control, register } = useRemixForm<FormData>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    resolver,
    defaultValues: {
      code: searchParams.get(verifyCodeKey) || undefined,
      redirectTo: searchParams.get(redirectToKey) || undefined,
      type,
      target,
    },
    submitHandlers: {
      onInvalid: (d) => console.log(d),
    },
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
    if (actionData?.errors?.code) {
      showToast({
        description: actionData.errors.code.message || 'Unexpected error',
        type: 'error',
        id: 'verify-code',
      })
    }
  }, [actionData])

  return (
    <main className={styles.auth__content}>
      <AuthFormHeader type={type} email={target} />
      <Form
        onSubmit={handleSubmit}
        method="POST"
        viewTransition
        className={styles.auth__form}
      >
        <HoneypotInputs />
        <Controller
          control={control}
          name="code"
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
        <input {...register(verifyTypeKey)} hidden />
        <input {...register(targetKey)} hidden />
        <input {...register(redirectToKey)} hidden />
        <Button
          variant={count === 0 ? 'tertiary' : 'tertiary-dimmed'}
          disabled={isResendButtonDisabled}
          size="sm"
          type="button"
          onClick={handleCodeResend}
        >
          {didResendVerificationCode && 'A new code has been sent'}
          {!didResendVerificationCode &&
            `Didn't recieve a code? Resend${count === 0 ? '' : ` (${count})`}`}
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
    </main>
  )
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />
}
