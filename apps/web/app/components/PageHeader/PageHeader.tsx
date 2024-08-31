import React from 'react'
import styles from './PageHeader.module.css'
import Wrapper, { WrapperProps } from '@valley/ui/Wrapper'
import cx from 'classnames'

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
    <Wrapper {...props} className={cx(styles.pageHeader, className)}>
      <h1 className={styles.pageHeader__title}>{children}</h1>
      <div className={styles.pageHeader__before}>{before}</div>
    </Wrapper>
  )
}

export default PageHeader
