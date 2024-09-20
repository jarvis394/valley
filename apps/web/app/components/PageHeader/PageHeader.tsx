import React from 'react'
import styles from './PageHeader.module.css'
import Wrapper, { WrapperOwnProps } from '@valley/ui/Wrapper'
import cx from 'classnames'
import Stack from '@valley/ui/Stack'

type PageHeaderProps = WrapperOwnProps & {
  before?: React.ReactElement
  headerProps?: React.ComponentPropsWithoutRef<'h1'>
} & React.ComponentPropsWithoutRef<'div'>

const PageHeader: React.FC<PageHeaderProps> = ({
  children,
  before,
  className,
  headerProps,
  ...props
}) => {
  const { className: headerClassName, ...restHeaderProps } = headerProps || {}

  return (
    <Stack
      {...props}
      renderRoot={(props) => <Wrapper {...props} component="div" />}
      gap={4}
      direction={{ md: 'column', lg: 'row' }}
      className={cx(styles.pageHeader, className)}
    >
      <h1
        {...restHeaderProps}
        className={cx(styles.pageHeader__title, headerClassName)}
      >
        {children}
      </h1>
      <div className={styles.pageHeader__before}>{before}</div>
    </Stack>
  )
}

export default PageHeader
