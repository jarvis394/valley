import React from 'react'
import styles from './PageHeader.module.css'
import Wrapper, { WrapperProps } from '@valley/ui/Wrapper'
import cx from 'classnames'
import Stack from '@valley/ui/Stack'

type PageHeaderProps = WrapperProps & {
  before?: React.ReactElement
}

const PageHeader: React.FC<PageHeaderProps> = ({
  children,
  before,
  className,
  ...props
}) => {
  return (
    <Stack
      {...props}
      as={Wrapper}
      gap={4}
      direction={{ md: 'column', lg: 'row' }}
      className={cx(styles.pageHeader, className)}
    >
      <h1 className={styles.pageHeader__title}>{children}</h1>
      <div className={styles.pageHeader__before}>{before}</div>
    </Stack>
  )
}

export default PageHeader
