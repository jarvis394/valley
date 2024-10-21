import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { type ActionFunctionArgs } from '@remix-run/node'
import { Form, useActionData, useSearchParams } from '@remix-run/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { GeneralErrorBoundary } from '../../../components/ErrorBoundary'
import { checkHoneypot } from '../../../server/honeypot.server'
import { useIsPending } from '../../../utils/misc'
import { validateRequest } from './verify.server'
import OTPInput from '@valley/ui/OTPInput'
import Button from '@valley/ui/Button'
import styles from '../auth.module.css'
import Stack from '@valley/ui/Stack'

export const handle: SEOHandle = {
  getSitemapEntries: () => null,
}

export const codeQueryParam = 'code'
export const targetQueryParam = 'target'
export const typeQueryParam = 'type'
export const redirectToQueryParam = 'redirectTo'
const types = ['onboarding', 'reset-password', 'change-email', '2fa'] as const
const VerificationTypeSchema = z.enum(types)
export type VerificationTypes = z.infer<typeof VerificationTypeSchema>

const checkEmail = (
  <>
    <h1 className={styles.auth__contentHeader}>Check your email</h1>
    <p className={styles.auth__contentSubtitle}>
      We&apos;ve sent you a code to verify your email address.
    </p>
  </>
)

const headings: Record<VerificationTypes, React.ReactNode> = {
  onboarding: checkEmail,
  'reset-password': checkEmail,
  'change-email': checkEmail,
  '2fa': (
    <>
      <h1 className={styles.auth__contentHeader}>Check your 2FA app</h1>
      <p className={styles.auth__contentSubtitle}>
        Please enter your 2FA code to verify your identity.
      </p>
    </>
  ),
}

export const VerifySchema = z.object({
  [codeQueryParam]: z.string().min(6).max(6),
  [typeQueryParam]: VerificationTypeSchema,
  [targetQueryParam]: z.string(),
  [redirectToQueryParam]: z.string().optional(),
})

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  checkHoneypot(formData)
  return validateRequest(request, formData)
}

export default function VerifyRoute() {
  const [searchParams] = useSearchParams()
  const isPending = useIsPending()
  const actionData = useActionData<typeof action>()
  const parseWithZodType = VerificationTypeSchema.safeParse(
    searchParams.get(typeQueryParam)
  )
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
      type: type,
      target: searchParams.get(targetQueryParam),
      redirectTo: searchParams.get(redirectToQueryParam),
    },
  })

  return (
    <main className={styles.auth__content}>
      <Stack>{type ? headings[type] : headings['onboarding']}</Stack>
      <Form method="POST" {...getFormProps(form)} className={styles.auth__form}>
        <HoneypotInputs />
        <OTPInput
          labelProps={{
            htmlFor: fields[codeQueryParam].id,
            children: 'Code',
          }}
          inputProps={{
            ...getInputProps(fields[codeQueryParam], { type: 'text' }),
            autoComplete: 'one-time-code',
            autoFocus: true,
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
      </Form>
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
    </main>
  )
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />
}
