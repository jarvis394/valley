import React from 'react'

const Gallery: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.9 13.98L11 16.51L14.1 12.52C14.3 12.26 14.7 12.26 14.9 12.53L18.41 17.21C18.66 17.54 18.42 18.01 18.01 18.01H6.02C5.6 18.01 5.37 17.53 5.63 17.2L8.12 14C8.31 13.74 8.69 13.73 8.9 13.98Z"
        fill="url(#paint0_linear_1089_937)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_1089_937"
          x1="0.75"
          y1="36"
          x2="71.25"
          y2="36"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="currentColor" stopOpacity="0.07" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.01" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default Gallery