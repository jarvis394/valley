import { type Submission } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { z } from 'zod'
import { requireUserId } from '../../../server/auth/auth.server'
import { prisma } from '../../../server/db.server'
import { getDomainUrl } from '../../../utils/misc'
import { redirectWithToast } from '../../../server/toast.server'
import { generateTOTP, verifyTOTP } from '../../../server/totp.server'
import {
  handleVerification as handleLoginVerification,
  shouldRequestTwoFA,
} from '../login/login.server'
import { handleVerification as handleOnboardingVerification } from '../onboarding+/onboarding.server'
import {
  VerifySchema,
  verifyCodeKey,
  redirectToKey,
  targetKey,
  verifyTypeKey,
  type VerificationType,
} from '.'
import {
  twoFAVerificationType,
  twoFAVerifyVerificationType,
} from '../../_user+/account+/settings.authentication'
import { data } from '@remix-run/node'

export type VerifyFunctionArgs = {
  request: Request
  submission: Submission<
    z.input<typeof VerifySchema>,
    string[],
    z.output<typeof VerifySchema>
  >
  body: FormData | URLSearchParams
}

export function getRedirectToUrl({
  request,
  type,
  target,
  redirectTo,
}: {
  request: Request
  type: VerificationType
  target: string
  redirectTo?: string
}) {
  const redirectToUrl = new URL(`${getDomainUrl(request)}/auth/verify`)
  redirectToUrl.searchParams.set(verifyTypeKey, type)
  redirectToUrl.searchParams.set(targetKey, target)

  if (redirectTo) {
    redirectToUrl.searchParams.set(redirectToKey, redirectTo)
  }

  return redirectToUrl
}

export async function requireRecentVerification(request: Request) {
  const userId = await requireUserId(request)
  const shouldReverify = await shouldRequestTwoFA(request)

  if (shouldReverify) {
    const reqUrl = new URL(request.url)
    const redirectUrl = getRedirectToUrl({
      request,
      target: userId,
      type: twoFAVerificationType,
      redirectTo: reqUrl.pathname + reqUrl.search,
    })

    throw await redirectWithToast(redirectUrl.toString(), {
      title: 'Verification',
      description: 'Please reverify your account before proceeding',
    })
  }
}

export async function prepareVerification({
  period,
  request,
  type,
  target,
  redirectTo,
}: {
  period: number
  request: Request
  type: VerificationType
  target: string
  redirectTo?: string
}) {
  const verifyUrl = getRedirectToUrl({ request, type, target, redirectTo })
  const verifyRedirectTo = new URL(verifyUrl.toString())
  const { otp, ...verificationConfig } = await generateTOTP({
    period,
  })
  const verificationData = {
    type,
    target,
    ...verificationConfig,
    expiresAt: new Date(Date.now() + verificationConfig.period * 1000),
  }

  await prisma.verification.upsert({
    where: { target_type: { target, type } },
    create: verificationData,
    update: verificationData,
  })

  // add the otp to the url we'll email the user.
  verifyUrl.searchParams.set(verifyCodeKey, otp)

  return { otp, redirectTo: verifyRedirectTo, verifyUrl }
}

export async function isCodeValid({
  code,
  type,
  target,
}: {
  code: string
  type: VerificationType | typeof twoFAVerifyVerificationType
  target: string
}) {
  const verification = await prisma.verification.findUnique({
    where: {
      target_type: { target, type },
      OR: [{ expiresAt: { gt: new Date() } }, { expiresAt: null }],
    },
    select: { algorithm: true, secret: true, period: true, charSet: true },
  })
  if (!verification) return false
  const result = await verifyTOTP({
    otp: code,
    ...verification,
  })
  if (!result) return false

  return true
}

export async function validateRequest(
  request: Request,
  body: URLSearchParams | FormData
) {
  const submission = await parseWithZod(body, {
    schema: VerifySchema.superRefine(async (data, ctx) => {
      const codeIsValid = await isCodeValid({
        code: data[verifyCodeKey],
        type: data[verifyTypeKey],
        target: data[targetKey],
      })

      if (!codeIsValid) {
        ctx.addIssue({
          path: ['code'],
          code: z.ZodIssueCode.custom,
          message: 'Invalid code',
        })
        return
      }
    }),
    async: true,
  })

  if (submission.status !== 'success') {
    return data(
      { result: submission.reply() },
      { status: submission.status === 'error' ? 400 : 200 }
    )
  }

  const { value: submissionValue } = submission

  async function deleteVerification() {
    await prisma.verification.delete({
      where: {
        target_type: {
          type: submissionValue[verifyTypeKey],
          target: submissionValue[targetKey],
        },
      },
    })
  }

  switch (submissionValue[verifyTypeKey]) {
    // case 'reset-password': {
    //   await deleteVerification()
    //   return handleResetPasswordVerification({ request, body, submission })
    // }
    case 'onboarding': {
      await deleteVerification()
      return handleOnboardingVerification({ request, body, submission })
    }
    // case 'change-email': {
    //   await deleteVerification()
    //   return handleChangeEmailVerification({ request, body, submission })
    // }
    case 'auth':
    case '2fa': {
      return handleLoginVerification({ request, body, submission })
    }
    default:
      return redirectWithToast('/auth/login', {
        title: 'Not Implemented',
        type: 'error',
        description: 'This function was not implemented on backend',
      })
  }
}
