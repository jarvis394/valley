import React from 'react'
import styles from './Avatar.module.css'
import cx from 'classnames'
import Image, { ImageProps } from '../Image/Image'

export type AvatarProps = ImageProps & {
  square?: boolean
}

const Avatar: React.FC<AvatarProps> = ({
  className,
  src,
  file,
  thumbnail,
  imageHost,
  children,
  square,
  ...props
}) => {
  return (
    <div
      {...props}
      className={cx(styles.avatar, className, {
        [styles['avatar--square']]: square,
      })}
    >
      {file && (
        <Image
          {...props}
          file={file}
          thumbnail={thumbnail}
          imageHost={imageHost}
          width={64}
          height={64}
        />
      )}
      {src && !file && <Image {...props} src={src} width={28} height={28} />}
      {!src && children}
    </div>
  )
}

export default Avatar
