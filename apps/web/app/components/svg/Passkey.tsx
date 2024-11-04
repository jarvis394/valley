import React from 'react'

const Passkey: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 2.75C2 1.23122 3.23122 0 4.75 0H5.25C6.76878 0 8 1.23122 8 2.75V3.25C8 4.76878 6.76878 6 5.25 6H4.75C3.23122 6 2 4.76878 2 3.25V2.75ZM4.75 1.5C4.05964 1.5 3.5 2.05964 3.5 2.75V3.25C3.5 3.94036 4.05964 4.5 4.75 4.5H5.25C5.94036 4.5 6.5 3.94036 6.5 3.25V2.75C6.5 2.05964 5.94036 1.5 5.25 1.5H4.75ZM5 9C3.57922 9 2.27192 9.77606 1.59158 11.0234L1.5 11.1912V12.5H6H8.5H9V14H0.75H0V13.25V11V10.8088L0.0915783 10.6409L0.274735 10.3051C1.21793 8.57589 3.03031 7.5 5 7.5C6.50888 7.5 7.92544 8.13136 8.92967 9.20412L7.92725 10.3318C7.19883 9.49584 6.13566 9 5 9ZM16 6C16 7.35173 15.1748 8.51071 14.0006 9.00065L15.5 10.5L14 12L15.5 13.5L14 15L13 16L11.5 14.5V9.00092C10.3255 8.51114 9.5 7.35197 9.5 6C9.5 4.20507 10.9551 2.75 12.75 2.75C14.5449 2.75 16 4.20507 16 6ZM12.75 6.25C13.3023 6.25 13.75 5.80228 13.75 5.25C13.75 4.69772 13.3023 4.25 12.75 4.25C12.1977 4.25 11.75 4.69772 11.75 5.25C11.75 5.80228 12.1977 6.25 12.75 6.25Z"
        fill="white"
      />
    </svg>
  )
}

export default Passkey