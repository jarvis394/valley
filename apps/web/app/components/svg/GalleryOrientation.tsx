export const GalleryOrientationHorizontal: React.FC<
  React.SVGProps<SVGSVGElement>
> = (props) => (
  <svg width="31" height="22" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M0 0h9v10H0zm22 12h9v10h-9zM0 12h20v10H0zM11 0h20v10H11z"
      fill="currentColor"
      fillRule="evenodd"
    ></path>
  </svg>
)

export const GalleryOrientationVertical: React.FC<
  React.SVGProps<SVGSVGElement>
> = (props) => (
  <svg width="31" height="22" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M0 0h9v13H0zm0 15h9v7H0zM22 0h9v13h-9zm0 15h9v7h-9zM11 9h9v13h-9zm0-9h9v7h-9z"
      fill="currentColor"
      fillRule="evenodd"
    ></path>
  </svg>
)
