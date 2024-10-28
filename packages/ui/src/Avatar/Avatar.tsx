import React from 'react'
import styles from './Avatar.module.css'
import cx from 'classnames'

type AvatarProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>

const Avatar: React.FC<AvatarProps> = ({ className, ...props }) => {
  return (
    <div {...props} className={cx(styles.avatar, className)}>
      <img
        src={'https://avatars.githubusercontent.com/u/37776763?v=4'}
        alt="Avatar"
        width={28}
        height={28}
      />
    </div>
  )
}

export default Avatar
