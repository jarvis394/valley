import { useAutoAnimate } from '@formkit/auto-animate/react'
import { cloneElement, type PropsWithChildren } from 'react'

type AnimatedProps = PropsWithChildren<{ asChild?: boolean }>

const Animated = (props: AnimatedProps) => {
  const { children, asChild } = props
  const [ref] = useAutoAnimate()

  if (asChild) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return cloneElement(children as any, { ref })
  }

  return <div ref={ref}>{children}</div>
}

export default Animated
