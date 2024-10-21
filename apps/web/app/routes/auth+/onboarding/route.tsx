import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
  json,
  redirect,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type MetaFunction,
} from '@remix-run/node'
import {
  Form,
  useActionData,
  useLoaderData,
  useSearchParams,
} from '@remix-run/react'
import {
  requireAnonymous,
  signup,
  sessionKey,
} from '../../../server/auth.server'
import { prisma } from '../../../server/db.server'
import { checkHoneypot } from '../../../server/honeypot.server'
import { authSessionStorage } from '../../../server/session.server'
import { redirectWithToast } from '../../../server/toast.server'
import { verifySessionStorage } from '../../../server/verification.server'
import { useIsPending } from '../../../utils/misc'
import {
  UsernameSchema,
  NameSchema,
  PasswordAndConfirmPasswordSchema,
} from '../../../utils/user-validation'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { z } from 'zod'

export const onboardingEmailSessionKey = 'onboardingEmail'

const SignupFormSchema = z
  .object({
    username: UsernameSchema,
    name: NameSchema,
    agreeToTermsOfServiceAndPrivacyPolicy: z.boolean({
      required_error:
        'You must agree to the terms of service and privacy policy',
    }),
    remember: z.boolean().optional(),
    redirectTo: z.string().optional(),
  })
  .and(PasswordAndConfirmPasswordSchema)

async function requireOnboardingEmail(request: Request) {
  await requireAnonymous(request)
  const verifySession = await verifySessionStorage.getSession(
    request.headers.get('cookie')
  )
  const email = verifySession.get(onboardingEmailSessionKey)
  if (typeof email !== 'string' || !email) {
    throw redirect('/signup')
  }
  return email
}

export async function loader({ request }: LoaderFunctionArgs) {
  const email = await requireOnboardingEmail(request)
  return json({ email })
}

export async function action({ request }: ActionFunctionArgs) {
  const email = await requireOnboardingEmail(request)
  const formData = await request.formData()
  checkHoneypot(formData)
  const submission = await parseWithZod(formData, {
    schema: (intent) =>
      SignupFormSchema.superRefine(async (data, ctx) => {
        const existingUser = await prisma.user.findUnique({
          where: { username: data.username },
          select: { id: true },
        })
        if (existingUser) {
          ctx.addIssue({
            path: ['username'],
            code: z.ZodIssueCode.custom,
            message: 'A user already exists with this username',
          })
          return
        }
      }).transform(async (data) => {
        if (intent !== null) return { ...data, session: null }

        const session = await signup({ ...data, email })
        return { ...data, session }
      }),
    async: true,
  })

  if (submission.status !== 'success' || !submission.value.session) {
    return json(
      { result: submission.reply() },
      { status: submission.status === 'error' ? 400 : 200 }
    )
  }

  const { session, remember, redirectTo } = submission.value

  const authSession = await authSessionStorage.getSession(
    request.headers.get('cookie')
  )
  authSession.set(sessionKey, session.id)
  const verifySession = await verifySessionStorage.getSession()
  const headers = new Headers()
  headers.append(
    'set-cookie',
    await authSessionStorage.commitSession(authSession, {
      expires: remember ? session.expirationDate : undefined,
    })
  )
  headers.append(
    'set-cookie',
    await verifySessionStorage.destroySession(verifySession)
  )

  return redirectWithToast(
    safeRedirect(redirectTo),
    { title: 'Welcome', description: 'Thanks for signing up!' },
    { headers }
  )
}

export const meta: MetaFunction = () => {
  return [{ title: 'Setup Epic Notes Account' }]
}

export default function OnboardingRoute() {
  const data = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const isPending = useIsPending()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')

  const [form, fields] = useForm({
    id: 'onboarding-form',
    constraint: getZodConstraint(SignupFormSchema),
    defaultValue: { redirectTo },
    lastResult: actionData?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SignupFormSchema })
    },
    shouldRevalidate: 'onBlur',
  })

  return (
    <div className="container flex min-h-full flex-col justify-center pb-32 pt-20">
      <div className="mx-auto w-full max-w-lg">
        <div className="flex flex-col gap-3 text-center">
          <h1 className="text-h1">Welcome aboard {data.email}!</h1>
          <p className="text-body-md text-muted-foreground">
            Please enter your details.
          </p>
        </div>

        <Form
          method="POST"
          className="mx-auto min-w-full max-w-sm sm:min-w-[368px]"
          {...getFormProps(form)}
        >
          <HoneypotInputs />
          <div className="flex items-center justify-between gap-6"></div>
        </Form>
      </div>
    </div>
  )
}
