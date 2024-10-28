'use client'
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
import { ActionFunctionArgs } from '@remix-run/node'
import { prisma } from '../../../server/db.server'
import { checkHoneypot } from '../../../server/honeypot.server'
import { EmailSchema } from '../../../utils/user-validation'
import { z } from 'zod'
import { prepareVerification } from '../verify/verify.server'
import { useIsPending } from '../../../utils/misc'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
// import {
//   removeAuthTokensFromLocalStorage,
//   setAuthTokensToLocalStorage,
// } from '../../../utils/accessToken'
// import { authorizeUser } from '../../../api/auth'

const SignupSchema = z.object({
  email: EmailSchema,
})

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

  console.log({ verifyUrl, otp })

  // const response = await sendEmail({
  //   to: email,
  //   subject: `Welcome to Epic Notes!`,
  //   react: <SignupEmail onboardingUrl={verifyUrl.toString()} otp={otp} />,
  // })

  return redirect(redirectTo.toString())
}

const RegisterPage: React.FC = () => {
  const actionData = useActionData<typeof action>()
  const isPending = useIsPending()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')

  const [form, fields] = useForm({
    id: 'signup-form',
    constraint: getZodConstraint(SignupSchema),
    lastResult: actionData?.result,
    onValidate({ formData }) {
      const result = parseWithZod(formData, { schema: SignupSchema })
      return result
    },
    shouldRevalidate: 'onBlur',
  })

  return (
    <main className={styles.auth__content}>
      <h1 className={styles.auth__contentHeader}>Create your Valley account</h1>
      <Form method="POST" {...getFormProps(form)} className={styles.auth__form}>
        <HoneypotInputs />
        <Input
          {...getInputProps(fields.email, {
            type: 'email',
          })}
          state={fields.email.errors ? 'error' : 'default'}
          required
          size="lg"
          placeholder="Email"
        />
        {/* <Input
          {...getInputProps(fields.password, {
            type: 'password',
          })}
          required
          state={fields.password.errors ? 'error' : 'default'}
          size="lg"
          placeholder="Password"
          autoComplete="current-password"
        /> */}
        <Button
          fullWidth
          loading={isPending}
          disabled={isPending}
          variant="primary"
          size="lg"
        >
          Continue
        </Button>
      </Form>
    </main>
  )
}

export default RegisterPage
