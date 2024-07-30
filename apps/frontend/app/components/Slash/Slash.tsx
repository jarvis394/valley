import React from 'react'
import styles from './Slash.module.css'
import cx from 'classnames'

type SlashProps = React.SVGProps<SVGSVGElement>

const Slash: React.FC<SlashProps> = ({ className, ...props }) => {
  return (
    <svg
      {...props}
      className={cx(styles.slash, className)}
      width="22"
      height="23"
      viewBox="0 0 22 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="5"
        y="19.5"
        width="20"
        height="2"
        transform="rotate(-60 5 19.5)"
        fill="currentColor"
      />
    </svg>
  )
}

export default Slash
