import React from 'react'
import styles from './PageHeader.module.css'
import Wrapper from '@valley/ui/Wrapper'

type PageHeaderProps = React.PropsWithChildren<{
  before?: React.ReactElement
}>

const PageHeader: React.FC<PageHeaderProps> = ({ children, before }) => {
  return (
    <Wrapper>
      <h1 className={styles.pageHeader__title}>{children}</h1>
      <div className={styles.pageHeader__before}>{before}</div>
    </Wrapper>
  )
}

export default PageHeader
