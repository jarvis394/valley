import React from 'react'
import { Link as RouterLink, type LinkProps } from 'react-router'
import cx from 'classnames'
import styles from './Link.module.css'

const Link: React.FC<LinkProps> = ({ className, ...props }) => {
  return <RouterLink className={cx(styles.link, className)} {...props} />
}

export default Link
