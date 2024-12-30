import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { type ActionFunctionArgs } from '@remix-run/cloudflare'
import { Form, Link, useActionData, useSearchParams } from '@remix-run/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { GeneralErrorBoundary } from '../../../components/ErrorBoundary'
import AuthFormHeader from '../../../components/AuthFormHeader/AuthFormHeader'
import { useIsPending } from '../../../utils/misc'
import { validateRequest } from './verify.server'
import OTPInput from '@valley/ui/OTPInput'
import Button from '@valley/ui/Button'
import styles from '../auth.module.css'
import { ArrowLeft } from 'geist-ui-icons'
import { useCountdown } from 'usehooks-ts'
import React, { useEffect, useState } from 'react'
import { showToast } from 'app/components/Toast/Toast'

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

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  return validateRequest(request, formData)
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
  const target = searchParams.get(targetKey)
  const type = parseWithZodType.success ? parseWithZodType.data : null
  const [form, fields] = useForm({
    id: 'code-verify-form',
    constraint: getZodConstraint(VerifySchema),
    lastResult: actionData?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: VerifySchema })
    },
    defaultValue: {
      code: searchParams.get(verifyCodeKey),
      redirectTo: searchParams.get(redirectToKey),
      type,
      target,
    },
  })
  const isResendButtonDisabled = count !== 0 || didResendVerificationCode

  const handleCodeResend: React.MouseEventHandler = (e) => {
    e.preventDefault()
    if (!form.value) return

    stopCountdown()
    setDidResendVerificationCode(true)
  }

  useEffect(() => {
    startCountdown()
  }, [startCountdown])

  useEffect(() => {
    if (actionData?.result.error) {
      showToast({
        description: actionData?.result.error.code?.[0] || 'Unexpected error',
        type: 'error',
        id: 'verify-code',
      })
    }
  }, [actionData?.result.error])

  return (
    <main className={styles.auth__content}>
      <AuthFormHeader type={type} email={target} />
      <Form
        {...getFormProps(form)}
        method="POST"
        viewTransition
        className={styles.auth__form}
      >
        <HoneypotInputs />
        <OTPInput
          inputProps={{
            ...getInputProps(fields[verifyCodeKey], { type: 'text' }),
            autoComplete: 'one-time-code',
            autoFocus: true,
            autoCorrect: 'false',
          }}
          errors={fields[verifyCodeKey].errors}
        />
        <input {...getInputProps(fields[verifyTypeKey], { type: 'hidden' })} />
        <input {...getInputProps(fields[targetKey], { type: 'hidden' })} />
        <input
          {...getInputProps(fields[redirectToKey], {
            type: 'hidden',
          })}
        />
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
