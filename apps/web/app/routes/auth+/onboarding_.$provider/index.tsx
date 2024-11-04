import {
  getFormProps,
  getInputProps,
  useForm,
  type SubmissionResult,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
  redirect,
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from '@remix-run/node'
import {
  type Params,
  Form,
  useActionData,
  useLoaderData,
  useSearchParams,
} from '@remix-run/react'
import { ProviderNameSchema } from '../../../config/connections'
import {
  requireAnonymous,
  authenticator,
  registerWithConnection,
  sessionKey,
} from '../../../server/auth.server'
import { connectionSessionStorage } from '../../../server/connections.server'
import { prisma } from '../../../server/db.server'
import { authSessionStorage } from '../../../server/session.server'
import { redirectWithToast } from '../../../server/toast.server'
import { verifySessionStorage } from '../../../server/verification.server'
import { UsernameSchema, NameSchema } from '../../../utils/user-validation'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { z } from 'zod'
import { onboardingEmailSessionKey } from '../onboarding+/onboarding.server'

export const providerIdKey = 'providerId'
export const providerNameKey = 'providerName'
export const prefilledProfileKey = 'prefilledProfile'

const SignupFormSchema = z.object({
  imageUrl: z.string().optional(),
  username: UsernameSchema,
  name: NameSchema,
  agreeToTermsOfServiceAndPrivacyPolicy: z.boolean({
    required_error: 'You must agree to the terms of service and privacy policy',
  }),
  remember: z.boolean().optional(),
  redirectTo: z.string().optional(),
})

async function requireData({
  request,
  params,
}: {
  request: Request
  params: Params
}) {
  await requireAnonymous(request)
  const verifySession = await verifySessionStorage.getSession(
    request.headers.get('cookie')
  )
  const email = verifySession.get(onboardingEmailSessionKey)
  const providerId = verifySession.get(providerIdKey)
  const result = z
    .object({
      email: z.string(),
      providerName: ProviderNameSchema,
      providerId: z.string(),
    })
    .safeParse({ email, providerName: params[providerNameKey], providerId })
  if (result.success) {
    return result.data
  } else {
    console.error(result.error)
    throw redirect('/auth/register')
  }
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { email } = await requireData({ request, params })
  const connectionSession = await connectionSessionStorage.getSession(
    request.headers.get('cookie')
  )
  const verifySession = await verifySessionStorage.getSession(
    request.headers.get('cookie')
  )
  const prefilledProfile = verifySession.get(prefilledProfileKey)

  const formError = connectionSession.get(authenticator.sessionErrorKey)
  const hasError = typeof formError === 'string'

  return json({
    email,
    status: 'idle',
    submission: {
      status: hasError ? 'error' : undefined,
      initialValue: prefilledProfile ?? {},
      error: { '': hasError ? [formError] : [] },
    } as SubmissionResult,
  })
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { email, providerId, providerName } = await requireData({
    request,
    params,
  })
  const formData = await request.formData()
  const verifySession = await verifySessionStorage.getSession(
    request.headers.get('cookie')
  )

  const submission = await parseWithZod(formData, {
    schema: SignupFormSchema.superRefine(async (data, ctx) => {
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      })
      if (existingUser) {
        ctx.addIssue({
          path: ['username'],
          code: z.ZodIssueCode.custom,
          message: 'A user already exists with this email',
        })
        return
      }
    }).transform(async (data) => {
      const session = await registerWithConnection({
        email,
        providerId,
        fullname: data.name,
        providerName,
      })
      return { ...data, session }
    }),
    async: true,
  })

  if (submission.status !== 'success') {
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

export default function OnboardingProviderRoute() {
  const data = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')

  const [form, fields] = useForm({
    id: 'onboarding-provider-form',
    constraint: getZodConstraint(SignupFormSchema),
    lastResult: actionData?.result ?? data.submission,
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
          {fields.imageUrl.initialValue ? (
            <div className="mb-4 flex flex-col items-center justify-center gap-4">
              <img
                src={fields.imageUrl.initialValue}
                alt="Profile"
                className="h-24 w-24 rounded-full"
              />
              <p className="text-body-sm text-muted-foreground">
                You can change your photo later
              </p>
              <input {...getInputProps(fields.imageUrl, { type: 'hidden' })} />
            </div>
          ) : null}

          {redirectTo && (
            <input type="hidden" name="redirectTo" value={redirectTo} />
          )}

          <div className="flex items-center justify-between gap-6"></div>
        </Form>
      </div>
    </div>
  )
}