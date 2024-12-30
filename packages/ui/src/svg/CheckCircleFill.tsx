import React from 'react'

const CheckCircleFill: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_813_1491)">
        <path
          d="M14.1569 14.1569C15.6571 12.6566 16.5 10.6217 16.5 8.5C16.5 6.37827 15.6571 4.34344 14.1569 2.84315C12.6566 1.34285 10.6217 0.5 8.5 0.5C6.37827 0.5 4.34344 1.34285 2.84315 2.84315C1.34285 4.34344 0.5 6.37827 0.5 8.5C0.5 10.6217 1.34285 12.6566 2.84315 14.1569C4.34344 15.6571 6.37827 16.5 8.5 16.5C10.6217 16.5 12.6566 15.6571 14.1569 14.1569Z"
          fill="currentColor"
          fillOpacity="0.12"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.5599 6.49994L7.52994 11.5299C7.38932 11.6704 7.19869 11.7493 6.99994 11.7493C6.80119 11.7493 6.61057 11.6704 6.46994 11.5299L4.43994 9.49994L5.49994 8.43994L6.99994 9.93994L11.4999 5.43994L12.5599 6.49994Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_813_1491">
          <rect
            width="16"
            height="16"
            fill="white"
            transform="translate(0.5 0.5)"
          />
        </clipPath>
      </defs>
    </svg>
  )
}

export default CheckCircleFill
