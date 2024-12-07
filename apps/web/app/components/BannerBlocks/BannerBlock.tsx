import Paper, { PaperProps } from '@valley/ui/Paper'
import cx from 'classnames'
import React from 'react'
import styles from './BannerBlock.module.css'

type BannerBlockProps = PaperProps

const BannerBlock: React.FC<BannerBlockProps> = ({
  children,
  className,
  variant = 'secondary',
  ...props
}) => {
  return (
    <Paper
      {...props}
      variant={variant}
      className={cx(styles.bannerBlock, className)}
    >
      {children}
    </Paper>
  )
}

export default BannerBlock
