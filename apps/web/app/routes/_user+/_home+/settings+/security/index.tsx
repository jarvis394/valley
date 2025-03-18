import { useActionData, useLoaderData, Form } from '@remix-run/react'
import {
  data,
  LoaderFunctionArgs,
  ShouldRevalidateFunction,
} from '@remix-run/router'
import Stack from '@valley/ui/Stack'
import React, { useState } from 'react'
import Paper from '@valley/ui/Paper'
import Animated from '@valley/ui/Animated'
import { CREDENTIAL_PROVIDER_NAME } from 'app/config/connections'
import Button from '@valley/ui/Button'
import styles from './security.module.css'
import PasswordField from 'app/components/PasswordField/PasswordField'
import {
  getValidatedFormData,
  RemixFormProvider,
  useRemixForm,
} from 'remix-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { requireUser, requireUserId } from 'app/server/auth/auth.server'
import { db } from '@valley/db'
import { FieldErrors } from 'react-hook-form'
import { auth } from '@valley/auth'
import { redirectWithToast } from 'app/server/toast.server'
import {
  PasswordSchema,
  passwordMinLengthError,
} from 'app/utils/user-validation'
import { useIsPending } from 'app/utils/misc'
import { authClient } from '@valley/auth/client'
import { makeTimings, time } from 'app/server/timing.server'
import ButtonBase from '@valley/ui/ButtonBase'
import dayjs from 'dayjs'
import { useRequestInfo } from 'app/utils/request-info'
import IconButton from '@valley/ui/IconButton'
import { MoreHorizontal } from 'geist-ui-icons'

export const UserSetPasswordSchema = z
  .object({
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
    currentPassword: PasswordSchema.optional(),
    revokeOtherSessions: z.boolean().optional().default(false),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'The passwords did not match',
        path: ['confirmPassword'],
      })
    }
  })

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserId(request)
  const timings = makeTimings('user accounts loader')
  const accountsPromise = time(
    () =>
      auth.api.listUserAccounts({
        headers: request.headers,
      }),
    {
      timings,
      type: 'user accounts',
    }
  )
  const passkeysPromise = time(
    () =>
      auth.api.listPasskeys({
        headers: request.headers,
      }),
    {
      timings,
      type: 'user passkeys',
    }
  )
  const [accounts, passkeys] = await Promise.all([
    accountsPromise,
    passkeysPromise,
  ])

  return data(
    { accounts, passkeys },
    { headers: { 'Server-Timing': timings.toString() } }
  )
}

export const shouldRevalidate: ShouldRevalidateFunction = () => {
  return true
}

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

type FormData = z.infer<typeof UserSetPasswordSchema>

const resolver = zodResolver(UserSetPasswordSchema)

const SecurityPage = () => {
  const data = useLoaderData<typeof loader>()
  const credentialsAccount = data.accounts.find(
    (e) => e.provider === CREDENTIAL_PROVIDER_NAME
  )
  const actionData = useActionData<typeof action>()
  const [isSetPasswordBlockShown, setSetPasswordBlockShown] = useState(false)
  const methods = useRemixForm<FormData>({
    mode: 'all',
    reValidateMode: 'onChange',
    resolver,
    defaultValues: actionData?.defaultValues,
    errors: actionData?.errors as FieldErrors<FormData>,
  })
  const isPending = useIsPending({
    formMethod: 'POST',
  })
  const requestInfo = useRequestInfo()

  const showSetPasswordBlock = (e: React.MouseEvent) => {
    e.preventDefault()
    methods.reset()
    setSetPasswordBlockShown(true)
  }

  const hideSetPasswordBlock = (e: React.MouseEvent) => {
    e.preventDefault()
    setSetPasswordBlockShown(false)
  }

  const setUpPasskey = async () => {
    const session = await authClient.getSession()
    await authClient.passkey.addPasskey({
      name: session.data?.user.name || 'Passkey',
    })
  }

  // TODO: implement in UI
  const _updatePasskey = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const id = e.currentTarget[0].nodeValue
    const name = e.currentTarget[1].nodeValue
    if (!name || !id) return

    await authClient.passkey.updatePasskey({
      name,
      id,
    })
  }

  return (
    <>
      <Stack
        padding={{ sm: [5, 4, 4, 4], md: 6, lg: 6, xl: 6 }}
        direction={'column'}
        gap={3}
        asChild
      >
        <Paper variant="secondary" rounded>
          <RemixFormProvider {...methods}>
            <h2 className={styles.security__blockTitle}>Password</h2>
            <p className={styles.security__blockSubtitle}>
              When you set up password you will still be able to use magic links
              to log in
            </p>
            <Animated>
              {credentialsAccount && !isSetPasswordBlockShown && (
                <Stack align="center" gap={4}>
                  <p className={styles.security__password}>••••••••••</p>
                  <Button
                    onClick={showSetPasswordBlock}
                    variant="secondary"
                    size="md"
                  >
                    Update password
                  </Button>
                </Stack>
              )}
              {!credentialsAccount && !isSetPasswordBlockShown && (
                <Button
                  onClick={showSetPasswordBlock}
                  variant="secondary"
                  size="md"
                >
                  Set password
                </Button>
              )}
              {!credentialsAccount && isSetPasswordBlockShown && (
                <Stack
                  gap={4}
                  padding={[4, 5]}
                  direction={'column'}
                  className={styles.security__form}
                  asChild
                >
                  <Form method="POST" onSubmit={methods.handleSubmit}>
                    <h3 className={styles.security__formTitle}>Set password</h3>
                    <PasswordField
                      {...methods.register('password')}
                      id="password"
                      label={'New password'}
                      helperText={passwordMinLengthError}
                      validHelperText="Your password meets all requirements"
                      fieldState={methods.getFieldState(
                        'password',
                        methods.formState
                      )}
                    />
                    <PasswordField
                      {...methods.register('confirmPassword')}
                      label={'Confirm password'}
                      id="confirm-password"
                      fieldState={methods.getFieldState(
                        'confirmPassword',
                        methods.formState
                      )}
                    />
                    <Stack gap={2} justify={'flex-end'}>
                      <Button
                        type="button"
                        onClick={hideSetPasswordBlock}
                        variant="tertiary-dimmed"
                      >
                        Cancel
                      </Button>
                      <Button
                        loading={isPending}
                        disabled={isPending}
                        type="submit"
                        variant="primary"
                      >
                        Save
                      </Button>
                    </Stack>
                  </Form>
                </Stack>
              )}
              {credentialsAccount && isSetPasswordBlockShown && (
                <Stack
                  gap={4}
                  padding={[4, 5]}
                  direction={'column'}
                  className={styles.security__form}
                  asChild
                >
                  <Form method="POST" onSubmit={methods.handleSubmit}>
                    <h3 className={styles.security__formTitle}>
                      Update password
                    </h3>
                    <PasswordField
                      {...methods.register('currentPassword')}
                      id="current-password"
                      autoComplete="current-password"
                      label={'Current password'}
                      fieldState={{
                        ...methods.getFieldState(
                          'currentPassword',
                          methods.formState
                        ),
                        isTouched: true,
                      }}
                    />
                    <PasswordField
                      {...methods.register('password')}
                      id="password"
                      label={'New password'}
                      autoComplete="new-password"
                      helperText={passwordMinLengthError}
                      validHelperText="Your password meets all requirements"
                      fieldState={methods.getFieldState(
                        'password',
                        methods.formState
                      )}
                    />
                    <PasswordField
                      {...methods.register('confirmPassword')}
                      label={'Confirm password'}
                      id="confirm-password"
                      fieldState={methods.getFieldState(
                        'confirmPassword',
                        methods.formState
                      )}
                    />
                    <Stack gap={2} justify={'flex-end'}>
                      <Button
                        type="button"
                        onClick={hideSetPasswordBlock}
                        variant="tertiary-dimmed"
                      >
                        Cancel
                      </Button>
                      <Button
                        loading={isPending}
                        disabled={isPending}
                        type="submit"
                        variant="primary"
                      >
                        Save
                      </Button>
                    </Stack>
                  </Form>
                </Stack>
              )}
            </Animated>
          </RemixFormProvider>
        </Paper>
      </Stack>

      <Stack
        padding={{ sm: [5, 4, 4, 4], md: 6, lg: 6, xl: 6 }}
        direction={'column'}
        gap={3}
        asChild
      >
        <Paper variant="secondary" rounded>
          <h2 className={styles.security__blockTitle}>Passkey</h2>
          <Stack direction="column" gap={1}>
            {data.passkeys.map((passkey) => (
              <Stack
                gap={8}
                key={passkey.id}
                direction="row"
                padding={2}
                className={styles.security__passkey}
                asChild
              >
                <ButtonBase variant="tertiary">
                  <Stack gap={1.5} direction="column" align="flex-start">
                    {passkey.name || 'Passkey'}
                    <p className={styles.security__passkeySubtitle}>
                      {dayjs(passkey.createdAt)
                        .tz(requestInfo.hints.timeZone)
                        .calendar()}
                    </p>
                  </Stack>
                  <IconButton variant="tertiary-dimmed">
                    <MoreHorizontal />
                  </IconButton>
                </ButtonBase>
              </Stack>
            ))}
          </Stack>
          <Button onClick={setUpPasskey} variant="secondary" size="md">
            Add passkey
          </Button>
        </Paper>
      </Stack>
    </>
  )
}

export default SecurityPage
