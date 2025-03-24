import { useAutoAnimate } from '@formkit/auto-animate/react'
import { cloneElement } from 'react'
import { AsChildProps } from '../types/AsChildProps'
import { AutoAnimateOptions } from '@formkit/auto-animate'

type AnimatedProps = AsChildProps<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
> & {
  options?: Partial<AutoAnimateOptions>
}

const Animated = ({ asChild, children, options, ...props }: AnimatedProps) => {
  const [ref] = useAutoAnimate(options)

  if (asChild) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return cloneElement(children as any, { ...props, ref })
  }

  return (
    <div {...props} ref={ref}>
      {children}
    </div>
  )
}

export default Animated
