import React from 'react'
import styles from './Avatar.module.css'
import cx from 'classnames'
import Image from 'next/image'

type AvatarProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>

const Avatar: React.FC<AvatarProps> = ({ className, ...props }) => {
  return (
    <div {...props} className={cx(styles.avatar, className)}>
      <Image
        src={'https://avatars.githubusercontent.com/u/37776763?v=4'}
        alt="Picture of the author"
        width={28}
        height={28}
      />
    </div>
  )
}

export default Avatar
