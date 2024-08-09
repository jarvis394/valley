import React from 'react'
import styles from './ModalFooter.module.css'

type ModalFooterProps = React.PropsWithChildren<{
  before?: React.ReactElement
  after?: React.ReactElement
}>

const ModalFooter: React.FC<ModalFooterProps> = ({
  before,
  after,
  children,
}) => {
  return (
    <div className={styles.modalFooter}>
      <div className={styles.modalFooter__before}>{before}</div>
      {children}
      <div className={styles.modalFooter__after}>{after}</div>
    </div>
  )
}

export default ModalFooter
