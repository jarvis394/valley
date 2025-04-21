import React from 'react'
import { cn } from '@valley/shared'
import { ExternalSmall } from 'geist-ui-icons'

export type ExternalLinkProps = React.PropsWithChildren<
  React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  >
>

const ExternalLink: React.FC<ExternalLinkProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <a
      className={cn(
        'inline-flex items-center gap-0.5 font-medium text-blue-600 hover:underline dark:text-blue-400',
        className
      )}
      target="_blank"
      rel="noreferrer"
      {...props}
    >
      {children}
      <ExternalSmall className="size-5" />
    </a>
  )
}

export default ExternalLink
