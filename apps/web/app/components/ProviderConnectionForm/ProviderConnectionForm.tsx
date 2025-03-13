import React from 'react'
import {
  PROVIDER_ICONS,
  PROVIDER_LABELS,
  SocialProviderName,
} from '../../config/connections'
import { useIsPending } from '../../utils/misc'
import Button, { ButtonProps } from '@valley/ui/Button'
import styles from './ProviderConnectionForm.module.css'
import cx from 'classnames'
import { authClient } from '@valley/auth/client'

type ProviderConnectionFormProps = {
  type: 'Connect' | 'Login' | 'Sign up'
  providerName: SocialProviderName
  redirectTo?: string | null
  buttonProps?: Omit<ButtonProps, 'asChild'>
}

export const ProviderConnectionForm: React.FC<ProviderConnectionFormProps> = ({
  type,
  providerName,
  buttonProps,
  redirectTo,
}) => {
  const formAction = `/auth/${providerName}`
  const isPending = useIsPending({ formAction })
  const label = PROVIDER_LABELS[providerName]

  const onClick = async () => {
    await authClient.signIn.social({
      provider: providerName,
      callbackURL: redirectTo || '/auth/login',
    })
  }

  return (
    <Button
      fullWidth
      {...buttonProps}
      style={{
        ['--themed-background' as string]: `var(--button-${providerName}-theme-bg)`,
        ['--themed-background-hover' as string]: `var(--button-${providerName}-theme-hovered-bg)`,
        ['--themed-color' as string]: `var(--button-${providerName}-theme-fg)`,
        ['--themed-color-hover' as string]: `var(--button-${providerName}-theme-hovered-fg)`,
        ['--themed-color-focus' as string]: `var(--button-${providerName}-theme-focused-fg)`,
      }}
      variant={'primary'}
      disabled={isPending || buttonProps?.disabled}
      loading={isPending || buttonProps?.loading}
      size="lg"
      type="submit"
      className={cx(styles.providerConnection__button, buttonProps?.className)}
      onClick={onClick}
      before={PROVIDER_ICONS[providerName]}
    >
      {type === 'Connect' && label}
      {type !== 'Connect' && (
        <>
          {type} with {label}
        </>
      )}
    </Button>
  )
}
