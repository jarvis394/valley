import React from 'react'

const ProjectCardSkeleton: React.FC<React.SVGProps<SVGSVGElement>> = (
  props
) => {
  return (
    <svg
      width={'100%'}
      viewBox="0 0 392 390"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_1015_427)">
        <rect
          x="1"
          y="1"
          width="389.333"
          height="388"
          rx="16"
          fill="var(--background-paper)"
        />
        <rect
          width="389.333"
          height="212"
          transform="translate(1 1)"
          fill="url(#paint0_linear_1015_427)"
        />
        <rect
          x="17"
          y="234"
          width="116"
          height="15"
          rx="4"
          fill="currentColor"
          fillOpacity="0.07"
        />
        <rect
          x="141"
          y="234"
          width="64"
          height="15"
          rx="4"
          fill="currentColor"
          fillOpacity="0.07"
        />
        <rect
          x="17"
          y="263"
          width="85"
          height="14"
          rx="4"
          fill="currentColor"
          fillOpacity="0.07"
        />
        <rect
          x="110"
          y="263"
          width="118"
          height="14"
          rx="4"
          fill="currentColor"
          fillOpacity="0.07"
        />
        <rect
          x="17"
          y="300"
          width="16"
          height="16"
          rx="4"
          fill="currentColor"
          fillOpacity="0.07"
        />
        <rect
          x="41"
          y="300"
          width="82"
          height="16"
          rx="4"
          fill="currentColor"
          fillOpacity="0.07"
        />
        <rect
          x="131"
          y="300"
          width="129"
          height="16"
          rx="4"
          fill="currentColor"
          fillOpacity="0.07"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M390.333 341L1 341L1 340L390.333 340V341Z"
          opacity="0.07"
        />
        <rect
          x="17"
          y="357"
          width="16"
          height="16"
          rx="4"
          fill="currentColor"
          fillOpacity="0.07"
        />
        <rect
          x="45"
          y="357"
          width="40"
          height="16"
          rx="4"
          fill="currentColor"
          fillOpacity="0.07"
        />
        <rect
          x="97"
          y="357"
          width="16"
          height="16"
          rx="4"
          fill="currentColor"
          fillOpacity="0.07"
        />
        <rect
          x="125"
          y="357"
          width="40"
          height="16"
          rx="4"
          fill="currentColor"
          fillOpacity="0.07"
        />
        <rect
          x="177"
          y="357"
          width="16"
          height="16"
          rx="4"
          fill="currentColor"
          fillOpacity="0.07"
        />
        <rect
          x="205"
          y="357"
          width="40"
          height="16"
          rx="4"
          fill="currentColor"
          fillOpacity="0.07"
        />
      </g>
      <rect
        x="0.5"
        y="0.5"
        width="390.333"
        height="389"
        rx="16.5"
        fillOpacity={0}
        fill="transparent"
        stroke="currentColor"
        strokeOpacity={0.07}
      />
      <defs>
        <linearGradient
          id="paint0_linear_1015_427"
          x1="194.667"
          y1="0"
          x2="194.667"
          y2="212"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="currentColor" stopOpacity="0" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.03" />
        </linearGradient>
        <clipPath id="clip0_1015_427">
          <rect
            x="1"
            y="1"
            width="389.333"
            height="388"
            rx="16"
            fill="currentColor"
          />
        </clipPath>
      </defs>
    </svg>
  )
}

export default ProjectCardSkeleton
