import Paper from '@valley/ui/Paper'
import Stack from '@valley/ui/Stack'
import React, { useState } from 'react'
import styles from './security.module.css'
import { RemixFormProvider, useRemixForm } from 'remix-hook-form'
import { Form, useActionData } from '@remix-run/react'
import { CREDENTIAL_PROVIDER_NAME } from 'app/config/connections'
import { FieldErrors } from 'react-hook-form'
import Animated from '@valley/ui/Animated'
import Button from '@valley/ui/Button'
import PasswordField from 'app/components/PasswordField/PasswordField'
import { passwordMinLengthError } from 'app/utils/user-validation'
import { useIsPending } from 'app/utils/misc'
import { FormData, resolver, AccountData } from '.'

type FormComponentProps = {
  methods: ReturnType<typeof useRemixForm<FormData>>
  onClose: (e: React.MouseEvent) => void
}

const UpdatePasswordForm: React.FC<FormComponentProps> = ({
  methods,
  onClose,
}) => {
  const isPending = useIsPending({
    formMethod: 'POST',
  })

  return (
    <Stack
      gap={4}
      padding={[4, 5]}
      direction={'column'}
      className={styles.security__form}
      asChild
    >
      <Form method="POST" onSubmit={methods.handleSubmit}>
        <h3 className={styles.security__formTitle}>Update password</h3>
        <PasswordField
          {...methods.register('currentPassword')}
          id="current-password"
          autoComplete="current-password"
          label={'Current password'}
          fieldState={{
            ...methods.getFieldState('currentPassword', methods.formState),
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
          fieldState={methods.getFieldState('password', methods.formState)}
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
          <Button type="button" onClick={onClose} variant="tertiary-dimmed">
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
  )
}

const SetPasswordForm: React.FC<FormComponentProps> = ({
  methods,
  onClose,
}) => {
  const isPending = useIsPending({
    formMethod: 'POST',
  })

  return (
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
          fieldState={methods.getFieldState('password', methods.formState)}
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
          <Button type="button" onClick={onClose} variant="tertiary-dimmed">
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
  )
}

const Password: React.FC<{ data: AccountData[] }> = ({ data }) => {
  const credentialsAccount = data.find(
    (e) => e.provider === CREDENTIAL_PROVIDER_NAME
  )
  const actionData = useActionData<{
    ok: boolean
    defaultValues?: FormData
    errors?: FieldErrors<FormData>
  }>()
  const [isFormShown, setFormShown] = useState(false)
  const methods = useRemixForm<FormData>({
    mode: 'all',
    reValidateMode: 'onChange',
    resolver,
    defaultValues: actionData?.defaultValues,
    errors: actionData?.errors as FieldErrors<FormData>,
  })

  const showForm = (e: React.MouseEvent) => {
    e.preventDefault()
    methods.reset()
    setFormShown(true)
  }

  const hideForm = (e: React.MouseEvent) => {
    e.preventDefault()
    setFormShown(false)
  }

  return (
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
            {credentialsAccount && !isFormShown && (
              <Stack align="center" gap={4}>
                <p className={styles.security__password}>••••••••••</p>
                <Button onClick={showForm} variant="secondary" size="md">
                  Update password
                </Button>
              </Stack>
            )}
            {!credentialsAccount && !isFormShown && (
              <Button onClick={showForm} variant="secondary" size="md">
                Set password
              </Button>
            )}
            {!credentialsAccount && isFormShown && (
              <SetPasswordForm onClose={hideForm} methods={methods} />
            )}
            {credentialsAccount && isFormShown && (
              <UpdatePasswordForm onClose={hideForm} methods={methods} />
            )}
          </Animated>
        </RemixFormProvider>
      </Paper>
    </Stack>
  )
}

export default Password
