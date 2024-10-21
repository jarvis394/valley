import React from 'react'
import {
  PROVIDER_ICONS,
  PROVIDER_LABELS,
  ProviderName,
} from '../../config/connections'
import { useIsPending } from '../../utils/misc'
import { Form } from '@remix-run/react'
import Button, { ButtonProps } from '@valley/ui/Button'
import styles from './ProviderConnectionForm.module.css'
import cx from 'classnames'

type ProviderConnectionFormProps = {
  type: 'Connect' | 'Login' | 'Signup'
  providerName: ProviderName
  redirectTo?: string | null
  buttonProps?: ButtonProps
}

export const ProviderConnectionForm: React.FC<ProviderConnectionFormProps> = ({
  redirectTo,
  type,
  providerName,
  buttonProps,
}) => {
  const formAction = `/auth/${providerName}`
  const isPending = useIsPending({ formAction })

  return (
    <Form method="POST" action={formAction}>
      {redirectTo ? (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      ) : null}
      <Button
        {...buttonProps}
        style={{
          ['--themed-background' as string]: `var(--button-${providerName}-theme-bg)`,
          ['--themed-background-hover' as string]: `var(--button-${providerName}-theme-hovered-bg)`,
          ['--themed-color' as string]: `var(--button-${providerName}-theme-fg)`,
          ['--themed-color-hover' as string]: `var(--button-${providerName}-theme-hovered-fg)`,
          ['--themed-color-focus' as string]: `var(--button-${providerName}-theme-focused-fg)`,
        }}
        fullWidth
        variant={providerName === 'google' ? 'primary' : 'tertiary'}
        disabled={isPending || buttonProps?.disabled}
        size="lg"
        className={cx(
          styles.providerConnection__button,
          buttonProps?.className
        )}
        before={PROVIDER_ICONS[providerName]}
      >
        {type} with {PROVIDER_LABELS[providerName]}
      </Button>
    </Form>
  )
}
