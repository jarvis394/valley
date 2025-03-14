import { zodResolver } from '@hookform/resolvers/zod'
import { data, LoaderFunctionArgs, redirect } from '@remix-run/node'
import { db } from '@valley/db'
import { requireUser } from 'app/server/auth/auth.server'
import { redirectWithToast } from 'app/server/toast.server'
import { getValidatedFormData } from 'remix-hook-form'
import { z } from 'zod'
import { PasswordSchema } from 'app/utils/user-validation'
import { CREDENTIAL_PROVIDER_NAME } from 'app/config/connections'
import { auth } from '@valley/auth'
import { FieldErrors } from 'react-hook-form'

export const UserSetPasswordSchema = z.object({
  password: PasswordSchema,
  currentPassword: PasswordSchema.optional(),
  revokeOtherSessions: z.boolean().optional().default(false),
})

type FormData = z.infer<typeof UserSetPasswordSchema>

const resolver = zodResolver(UserSetPasswordSchema)

export const loader = () => redirect('/projects')

export const action = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request)

  const {
    errors,
    data: submissionData,
    receivedValues: defaultValues,
  } = await getValidatedFormData<FormData>(request, resolver)
  if (errors) {
    return data(
      { ok: false, errors, defaultValues },
      {
        status: 400,
      }
    )
  }

  const exists = await db.query.accounts.findFirst({
    where: (accounts, { eq, and }) =>
      and(
        eq(accounts.userId, user.id),
        eq(accounts.providerId, CREDENTIAL_PROVIDER_NAME)
      ),
  })

  if (exists) {
    if (!submissionData.currentPassword) {
      return data(
        {
          ok: false,
          errors: {
            currentPassword: {
              type: 'required',
            },
          } satisfies FieldErrors<FormData>,
          defaultValues,
        },
        {
          status: 400,
        }
      )
    }

    const res = await auth.api.changePassword({
      body: {
        currentPassword: submissionData.currentPassword,
        newPassword: submissionData.password,
        revokeOtherSessions: submissionData.revokeOtherSessions,
      },
      asResponse: true,
    })

    return redirectWithToast(
      '/settings/auth',
      {
        type: 'info',
        description: 'Password has been updated',
      },
      {
        headers: res.headers,
      }
    )
  } else {
    const res = await auth.api.setPassword({
      body: {
        newPassword: submissionData.password,
      },
    })

    if (res.status) {
      return redirectWithToast('/settings/auth', {
        type: 'info',
        description: 'Password has been set',
      })
    } else {
      return data(
        {
          ok: false,
          errors: {
            password: {
              type: 'value',
              message: 'Unknown error occurred',
            },
          } satisfies FieldErrors<FormData>,
          defaultValues,
        },
        {
          status: 500,
        }
      )
    }
  }
}
