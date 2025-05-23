import { Await } from 'react-router'
import { UserFull } from '@valley/shared'
import Note from '@valley/ui/Note'
import Stack from '@valley/ui/Stack'
import TextField from '@valley/ui/TextField'
import Fieldset from 'app/components/Fieldset/Fieldset'
import { UserDomainAddSchema } from 'app/routes/api+/user+/domain'
import { UserEditSchema } from 'app/routes/api+/user+/edit'
import { useUserAwait } from 'app/utils/user'
import React, { Suspense } from 'react'
import { useRootLoaderData } from 'app/utils/misc'
import ExternalLink from '@valley/ui/ExternalLink'

const AccountSettingsGeneral: React.FC<{
  user?: UserFull | null
}> = ({ user }) => {
  const { ENV } = useRootLoaderData()
  const serviceDomain = user?.serviceDomain
  const activeDomain = user?.domains[0]

  return (
    <>
      <Fieldset
        title={'Display Name'}
        subtitle={
          'Please enter your full name, or a display name you are comfortable with.'
        }
        before={'Please use 32 characters at maximum.'}
        submitConfig={{
          action: '/api/user/edit',
          preventScrollReset: true,
        }}
        schema={UserEditSchema}
        id="display-name-form"
      >
        {({ register, getFieldState, formState }) => (
          <TextField
            {...register('fullname')}
            fieldState={getFieldState('fullname', formState)}
            defaultValue={user?.name}
            size="lg"
            fullWidth={false}
          />
        )}
      </Fieldset>
      <Fieldset
        title={'Domain'}
        before={'Please use 32 characters at maximum.'}
        subtitle={
          <>
            Your galleries will be accessible on the{' '}
            <ExternalLink href={ENV.GALLERY_SERVICE_URL}>
              {ENV.GALLERY_SERVICE_URL}
            </ExternalLink>{' '}
            domain
          </>
        }
        content={
          <Note variant="default" fill style={{ width: 'fit-content' }}>
            <Stack direction={'column'} gap={0}>
              <b>Service Domain</b>
              {serviceDomain}
            </Stack>
          </Note>
        }
        submitConfig={{
          action: '/api/user/domain',
          preventScrollReset: true,
        }}
        schema={UserDomainAddSchema}
        id="user-domain-form"
      >
        {({ register, getFieldState, formState }) => (
          <TextField
            {...register('domain')}
            fieldState={getFieldState('domain', formState)}
            defaultValue={activeDomain || serviceDomain || ''}
            size="lg"
            fullWidth={false}
          />
        )}
      </Fieldset>
    </>
  )
}

const AccountSettingsGeneralRoute = () => {
  const user = useUserAwait()

  return (
    <Suspense>
      <Await resolve={user}>
        {(data) => <AccountSettingsGeneral user={data} />}
      </Await>
    </Suspense>
  )
}

export default React.memo(AccountSettingsGeneralRoute)
