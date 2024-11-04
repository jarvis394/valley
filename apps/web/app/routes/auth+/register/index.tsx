import Input from '@valley/ui/Input'
import React from 'react'
import styles from '../auth.module.css'
import Button from '@valley/ui/Button'
import {
  Form,
  json,
  redirect,
  useActionData,
  useSearchParams,
} from '@remix-run/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { prisma } from '../../../server/db.server'
import { checkHoneypot } from '../../../server/honeypot.server'
import { EmailSchema } from '../../../utils/user-validation'
import { z } from 'zod'
import { prepareVerification } from '../verify/verify.server'
import { useIsPending } from '../../../utils/misc'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { sendRegisterEmail } from '../../../server/email.server'
import Divider from '@valley/ui/Divider'
import { ProviderConnectionForm } from 'app/components/ProviderConnectionForm/ProviderConnectionForm'
import { PROVIDER_NAMES } from 'app/config/connections'
import Stack from '@valley/ui/Stack'
import { SEOHandle } from '@nasa-gcn/remix-seo'
import { requireAnonymous } from 'app/server/auth.server'
import { ArrowRight } from 'geist-ui-icons'
import { redirectToKey, targetKey } from '../verify'

const SignupSchema = z.object({
  email: EmailSchema,
  redirectTo: z.string().optional(),
})

export const handle: SEOHandle = {
  getSitemapEntries: () => null,
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAnonymous(request)
  return json({})
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()

  checkHoneypot(formData)

  const submission = await parseWithZod(formData, {
    schema: SignupSchema.superRefine(async (data, ctx) => {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
        select: { id: true },
      })

      if (existingUser) {
        return ctx.addIssue({
          path: ['email'],
          code: z.ZodIssueCode.custom,
          message: 'A user already exists with this email',
        })
      }
    }),
    async: true,
  })

  if (submission.status !== 'success') {
    return json(
      { result: submission.reply() },
      { status: submission.status === 'error' ? 400 : 200 }
    )
  }

  const { email } = submission.value
  const { verifyUrl, redirectTo, otp } = await prepareVerification({
    period: 10 * 60,
    request,
    type: 'onboarding',
    target: email,
  })

  const response = await sendRegisterEmail({
    code: otp,
    email,
    magicLink: verifyUrl.toString(),
  })

  if (response.status === 'success') {
    return redirect(redirectTo.toString())
  } else {
    return json(
      {
        result: submission.reply({ formErrors: [response.error.message] }),
      },
      { status: 500 }
    )
  }
}

const RegisterPage: React.FC = () => {
  const actionData = useActionData<typeof action>()
  const isPending = useIsPending()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get(redirectToKey)
  const target = searchParams.get(targetKey)

  const [form, fields] = useForm({
    id: 'signup-form',
    constraint: getZodConstraint(SignupSchema),
    lastResult: actionData?.result,
    onValidate({ formData }) {
      const result = parseWithZod(formData, { schema: SignupSchema })
      return result
    },
    defaultValue: { redirectTo, email: target },
    shouldRevalidate: 'onBlur',
  })

  return (
    <main className={styles.auth__content}>
      <h1 className={styles.auth__contentHeader}>Create your Valley account</h1>
      <Stack fullWidth gap={3} direction={'column'}>
        <Stack
          gap={2}
          fullWidth
          direction={'column'}
          style={{ viewTransitionName: 'auth-providers' }}
        >
          {PROVIDER_NAMES.map((providerName) => (
            <ProviderConnectionForm
              key={providerName}
              providerName={providerName}
              redirectTo={redirectTo}
              type="Sign up"
            />
          ))}
        </Stack>
        <Divider style={{ viewTransitionName: 'auth-divider' }}>OR</Divider>
        <Stack asChild gap={2} fullWidth direction={'column'}>
          <Form {...getFormProps(form)} method="POST" viewTransition>
            <HoneypotInputs />
            {redirectTo && (
              <input type="hidden" name="redirectTo" value={redirectTo} />
            )}
            <Input
              {...getInputProps(fields.email, {
                type: 'email',
              })}
              // We want to focus the field when user clicks "email edit" button on the next page
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus={!!target}
              state={fields.email.errors ? 'error' : 'default'}
              required
              size="lg"
              placeholder="Email"
              paperProps={{
                style: { viewTransitionName: 'auth-form-email-input' },
              }}
            />
            <Button
              fullWidth
              loading={isPending}
              disabled={isPending}
              variant="primary"
              size="lg"
              type="submit"
              after={<ArrowRight />}
              style={{ viewTransitionName: 'auth-form-submit' }}
            >
              Sign up with Email
            </Button>
          </Form>
        </Stack>
      </Stack>
    </main>
  )
}

export default RegisterPage
