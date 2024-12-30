import { useAutoAnimate } from '@formkit/auto-animate/react'
import { cloneElement } from 'react'
import { AsChildProps } from '../types/AsChildProps'

type AnimatedProps = AsChildProps<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
>

const Animated = ({ asChild, children, ...props }: AnimatedProps) => {
  const [ref] = useAutoAnimate()

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
