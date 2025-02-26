import { zodResolver } from '@hookform/resolvers/zod'
import { Form, SubmitOptions } from '@remix-run/react'
import Stack, { StackProps } from '@valley/ui/Stack'
import React, { useMemo } from 'react'
import { useRemixForm, UseRemixFormOptions } from 'remix-hook-form'
import { z, ZodType } from 'zod'
import styles from './Fieldset.module.css'
import Divider from '@valley/ui/Divider'
import Button, { ButtonProps } from '@valley/ui/Button'
import { useIsPending } from 'app/utils/misc'
import cx from 'classnames'

type FieldsetProps<T extends ZodType = ZodType> = {
  submitConfig?: SubmitOptions
  formConfig?: UseRemixFormOptions<z.infer<T>>
  stackProps?: Partial<StackProps>
  before?: React.ReactNode
  after?: React.ReactNode
  title?: React.ReactNode
  subtitle?: React.ReactNode
  content?: React.ReactNode
  variant?: 'default' | 'danger'
  id?: string
  submitLabel?: React.ReactNode
  submitProps?: Omit<ButtonProps, 'asChild'>
  children?: (
    ctx: Omit<ReturnType<typeof useRemixForm<z.infer<T>>>, 'handleSubmit'>
  ) => React.ReactNode
  schema: T
}

const Fieldset = <T extends ZodType>({
  submitConfig,
  formConfig,
  schema,
  stackProps,
  children,
  before,
  after: propsAfter,
  id,
  title,
  subtitle,
  content,
  variant = 'default',
  submitLabel = 'Save',
  submitProps,
  ...props
}: FieldsetProps<T>): React.ReactNode => {
  const isPending = useIsPending({
    formAction: submitConfig?.action,
    formMethod: submitConfig?.method,
  })
  type FormData = z.infer<typeof schema>
  const resolver = useMemo(() => zodResolver(schema), [schema])
  const after = useMemo(
    () =>
      propsAfter || (
        <Button
          size="md"
          variant="primary"
          {...submitProps}
          loading={isPending}
          disabled={isPending}
          form={id}
          type="submit"
        >
          {submitLabel}
        </Button>
      ),
    [propsAfter, submitProps, isPending, id, submitLabel]
  )
  const { handleSubmit, ...ctx } = useRemixForm<FormData>({
    ...formConfig,
    resolver,
    submitConfig: {
      navigate: true,
      viewTransition: true,
      method: 'POST',
      ...submitConfig,
    },
  })

  return (
    <Stack
      {...stackProps}
      className={cx(styles.fieldset, {
        [styles['fieldset--danger']]: variant === 'danger',
      })}
      direction={'column'}
      fullWidth
      asChild
    >
      <Form
        viewTransition
        action={submitConfig?.action}
        method={submitConfig?.method || 'POST'}
        {...props}
        id={id}
        onSubmit={handleSubmit}
      >
        <Stack
          padding={{ sm: [6, 4, 4, 4], md: 6, lg: 6, xl: 6 }}
          direction={'column'}
          gap={4}
        >
          {(title || subtitle || content) && (
            <Stack direction={'column'} gap={3}>
              {title && <h2>{title}</h2>}
              {subtitle && <p>{subtitle}</p>}
              {content}
            </Stack>
          )}
          {children?.(ctx)}
        </Stack>
        <Divider className={styles.fieldset__divider} variant="dimmed" />
        <Stack
          gap={4}
          justify={'space-between'}
          align={'center'}
          direction={{ sm: 'column', md: 'row', lg: 'row', xl: 'row' }}
          padding={{ sm: 4, md: [3, 6], lg: [3, 6], xl: [3, 6] }}
          asChild
        >
          <footer className={styles.fieldset__footer}>
            {before && (
              <Stack
                className={styles.fieldset__footerBefore}
                direction={'row'}
                gap={2}
              >
                {before}
              </Stack>
            )}
            <Stack
              fullWidth
              justify={{ sm: 'center', md: 'flex-end' }}
              direction={'row'}
              gap={2}
            >
              {after}
            </Stack>
          </footer>
        </Stack>
      </Form>
    </Stack>
  )
}

export default Fieldset
