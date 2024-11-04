import React from 'react'
import styles from '../auth.module.css'
import { SEOHandle } from '@nasa-gcn/remix-seo'
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import {
  Form,
  json,
  Link,
  useActionData,
  useSearchParams,
} from '@remix-run/react'
import { login, requireAnonymous } from '../../../server/auth.server'
import Input from '@valley/ui/Input'
import Button from '@valley/ui/Button'
import { ArrowLeft } from 'geist-ui-icons'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { checkHoneypot } from '../../../server/honeypot.server'
import { PasswordSchema, EmailSchema } from '../../../utils/user-validation'
import { z } from 'zod'
import { handleNewSession } from '../login/login.server'
import { useIsPending } from '../../../utils/misc'
import AuthFormHeader from '../../../components/AuthFormHeader/AuthFormHeader'
import { redirectToKey, targetKey } from '../verify'

const LoginFormSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
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
  await requireAnonymous(request)

  const formData = await request.formData()
  checkHoneypot(formData)

  const submission = await parseWithZod(formData, {
    schema: (intent) =>
      LoginFormSchema.transform(async (data, ctx) => {
        if (intent !== null) return { ...data, session: null }

        const session = await login(data)
        if (!session) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid username or password',
          })
          return z.NEVER
        }

        return { ...data, session }
      }),
    async: true,
  })

  if (submission.status !== 'success' || !submission.value.session) {
    return json(
      { result: submission.reply({ hideFields: ['password'] }) },
      { status: submission.status === 'error' ? 400 : 200 }
    )
  }

  const { session, redirectTo } = submission.value

  return handleNewSession({
    request,
    session,
    redirectTo,
  })
}

const LoginViaEmailPage: React.FC = () => {
  const actionData = useActionData<typeof action>()
  const [searchParams] = useSearchParams()
  const isPending = useIsPending()
  const redirectTo = searchParams.get(redirectToKey)
  const target = searchParams.get(targetKey)
  const [form, fields] = useForm({
    id: 'login-form',
    constraint: getZodConstraint(LoginFormSchema),
    defaultValue: { redirectTo },
    lastResult: actionData?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: LoginFormSchema })
    },
    shouldRevalidate: 'onBlur',
  })

  return (
    <main className={styles.auth__content}>
      <AuthFormHeader type="password" email={target} />
      <Form
        {...getFormProps(form)}
        method="POST"
        className={styles.auth__form}
        style={{ viewTransitionName: 'auth-form' }}
      >
        {target && <input hidden name="email" value={target} type="email" />}
        <Input
          {...getInputProps(fields.password, {
            type: 'password',
          })}
          // This should be always auto focused, as we are transitioning within the same form
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          required
          state={fields.password.errors ? 'error' : 'default'}
          size="lg"
          placeholder="Password"
          autoComplete="current-password"
        />
        <Button
          fullWidth
          loading={isPending}
          disabled={isPending}
          variant="primary"
          size="lg"
        >
          Continue
        </Button>
        <Button
          asChild
          variant="tertiary-dimmed"
          before={<ArrowLeft />}
          size="md"
        >
          <Link to="/auth/login" viewTransition>
            Other Login options
          </Link>
        </Button>
      </Form>
    </main>
  )
}

export default LoginViaEmailPage
