import React from 'react'

const InfoCircleFill: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_813_1527)">
        <path
          d="M14.1569 14.1569C15.6571 12.6566 16.5 10.6217 16.5 8.5C16.5 6.37827 15.6571 4.34344 14.1569 2.84315C12.6566 1.34285 10.6217 0.5 8.5 0.5C6.37827 0.5 4.34344 1.34285 2.84315 2.84315C1.34285 4.34344 0.5 6.37827 0.5 8.5C0.5 10.6217 1.34285 12.6566 2.84315 14.1569C4.34344 15.6571 6.37827 16.5 8.5 16.5C10.6217 16.5 12.6566 15.6571 14.1569 14.1569Z"
          fill="currentColor"
          fillOpacity="0.12"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.5 6.5C8.76522 6.5 9.01957 6.39464 9.20711 6.20711C9.39464 6.01957 9.5 5.76522 9.5 5.5C9.5 5.23478 9.39464 4.98043 9.20711 4.79289C9.01957 4.60536 8.76522 4.5 8.5 4.5C8.23478 4.5 7.98043 4.60536 7.79289 4.79289C7.60536 4.98043 7.5 5.23478 7.5 5.5C7.5 5.76522 7.60536 6.01957 7.79289 6.20711C7.98043 6.39464 8.23478 6.5 8.5 6.5ZM7.5 7.5H6.75V9H7.75V11.75H9.25V8.5C9.25 8.23478 9.14464 7.98043 8.95711 7.79289C8.76957 7.60536 8.51522 7.5 8.25 7.5H7.5Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_813_1527">
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

export default InfoCircleFill
