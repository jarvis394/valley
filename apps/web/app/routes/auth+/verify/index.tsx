import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { type ActionFunctionArgs } from '@remix-run/node'
import { Form, Link, useActionData, useSearchParams } from '@remix-run/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { GeneralErrorBoundary } from '../../../components/ErrorBoundary'
import { checkHoneypot } from '../../../server/honeypot.server'
import { useIsPending } from '../../../utils/misc'
import { validateRequest } from './verify.server'
import OTPInput from '@valley/ui/OTPInput'
import Button from '@valley/ui/Button'
import styles from '../auth.module.css'
import verifyStyles from './verify.module.css'
import Stack from '@valley/ui/Stack'
import { ArrowLeft, PencilEdit } from 'geist-ui-icons'
import { useCountdown } from 'usehooks-ts'
import { useEffect, useState } from 'react'
import ButtonBase from '@valley/ui/ButtonBase'

export const handle: SEOHandle = {
  getSitemapEntries: () => null,
}

export const TOTP_RESEND_TIMEOUT = 30

export const codeQueryParam = 'code'
export const targetQueryParam = 'target'
export const typeQueryParam = 'type'
export const redirectToQueryParam = 'redirectTo'
const types = ['onboarding', 'reset-password', 'change-email', '2fa'] as const
const VerificationTypeSchema = z.enum(types)
export type VerificationType = z.infer<typeof VerificationTypeSchema>
export const VerifySchema = z.object({
  [codeQueryParam]: z.string().length(6),
  [typeQueryParam]: VerificationTypeSchema,
  [targetQueryParam]: z.string(),
  [redirectToQueryParam]: z.string().optional(),
})

type HeadingProps = {
  type?: VerificationType | null
  email?: string | null
}

const Heading: React.FC<HeadingProps> = ({ type, email }) => {
  const emailEditHref = type === 'onboarding' ? '/auth/register' : '/auth/login'

  switch (type) {
    case 'change-email':
    case 'onboarding':
    case 'reset-password':
      return (
        <Stack gap={2} direction={'column'}>
          <h1 className={styles.auth__contentHeader}>Check your email</h1>
          <Stack gap={0.5} direction="column">
            <p className={styles.auth__contentSubtitle}>
              We&apos;ve sent you a code to verify
              <br /> your email address.
            </p>
            <Stack
              className={verifyStyles.verify__email}
              direction="row"
              align="center"
              justify="center"
              gap={1}
            >
              {email}
              <ButtonBase
                asChild
                className={verifyStyles.verify__emailEdit}
                variant="tertiary"
              >
                <Link to={emailEditHref}>
                  <PencilEdit />
                </Link>
              </ButtonBase>
            </Stack>
          </Stack>
        </Stack>
      )

    case '2fa':
    default:
      return (
        <Stack gap={2} direction={'column'}>
          <h1 className={styles.auth__contentHeader}>Check your 2FA app</h1>
          <p className={styles.auth__contentSubtitle}>
            Enter your 2FA code to verify your identity.
          </p>
        </Stack>
      )
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  checkHoneypot(formData)
  return validateRequest(request, formData)
}

export default function VerifyRoute() {
  const [searchParams] = useSearchParams()
  const [didResendVerificationCode, setDidResendVerificationCode] =
    useState(false)
  const isPending = useIsPending()
  const actionData = useActionData<typeof action>()
  const parseWithZodType = VerificationTypeSchema.safeParse(
    searchParams.get(typeQueryParam)
  )
  const [count, { startCountdown, stopCountdown }] = useCountdown({
    countStart: TOTP_RESEND_TIMEOUT,
  })
  const target = searchParams.get(targetQueryParam)
  const type = parseWithZodType.success ? parseWithZodType.data : null
  const [form, fields] = useForm({
    id: 'code-verify-form',
    constraint: getZodConstraint(VerifySchema),
    lastResult: actionData?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: VerifySchema })
    },
    defaultValue: {
      code: searchParams.get(codeQueryParam),
      redirectTo: searchParams.get(redirectToQueryParam),
      type,
      target,
    },
  })
  const isResendButtonDisabled = count !== 0 || didResendVerificationCode

  const handleCodeResend = () => {
    stopCountdown()
    setDidResendVerificationCode(true)
  }

  useEffect(() => {
    startCountdown()
  }, [startCountdown])

  return (
    <main className={styles.auth__content}>
      <Heading type={type} email={target} />
      <Form method="POST" {...getFormProps(form)} className={styles.auth__form}>
        <HoneypotInputs />
        <OTPInput
          inputProps={{
            ...getInputProps(fields[codeQueryParam], { type: 'text' }),
            autoComplete: 'one-time-code',
            autoFocus: true,
            autoCorrect: 'false',
          }}
          errors={fields[codeQueryParam].errors}
        />
        <input {...getInputProps(fields[typeQueryParam], { type: 'hidden' })} />
        <input
          {...getInputProps(fields[targetQueryParam], { type: 'hidden' })}
        />
        <input
          {...getInputProps(fields[redirectToQueryParam], {
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
            <Link to="/auth/register">Back to Sign Up options</Link>
          ) : (
            <Link to="/auth/login">Back to Login options</Link>
          )}
        </Button>
      </Form>
    </main>
  )
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />
}
