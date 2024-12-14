import cx from 'classnames'
import React from 'react'

const MenuExpand: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className,
  style,
  ...props
}) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      className={cx(className, 'svg-own-color')}
      style={{ ...style, fill: 'none' }}
    >
      <path
        d="M11.6667 5.678L8.33333 2L5 5.678M5 10.32L8.33333 13.998L11.6667 10.32"
        stroke="currentColor"
        strokeOpacity="0.63"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export default MenuExpand
