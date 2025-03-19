import { data, LoaderFunctionArgs } from '@remix-run/router'
import { auth } from '@valley/auth'
import { db } from '@valley/db'
import { CREDENTIAL_PROVIDER_NAME } from 'app/config/connections'
import { requireUser } from 'app/server/auth/auth.server'
import { redirectWithToast } from 'app/server/toast.server'
import { FieldErrors } from 'react-hook-form'
import { getValidatedFormData } from 'remix-hook-form'
import { FormData, resolver } from '.'

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

    try {
      const res = await auth.api.changePassword({
        body: {
          currentPassword: submissionData.currentPassword,
          newPassword: submissionData.password,
          revokeOtherSessions: submissionData.revokeOtherSessions,
        },
        headers: request.headers,
        returnHeaders: true,
      })

      return redirectWithToast(
        '/settings/security',
        {
          type: 'info',
          description: 'Password has been updated',
        },
        {
          headers: res.headers,
        }
      )
    } catch (e) {
      return data(
        {
          ok: false,
          errors: {
            currentPassword: {
              type: 'value',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              message: (e as any).body.message,
            },
          } satisfies FieldErrors<FormData>,
          defaultValues,
        },
        {
          status: 400,
        }
      )
    }
  } else {
    const res = await auth.api.setPassword({
      body: {
        newPassword: submissionData.password,
      },
      headers: request.headers,
    })

    if (res.status) {
      return redirectWithToast('/settings/security', {
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
