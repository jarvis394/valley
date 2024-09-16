'use client'
import React, { CSSProperties, useMemo } from 'react'
import styles from './Logo.module.css'
import cx from 'classnames'
import { HEADER_HEIGHT } from '../../config/constants'
import { map } from '../../utils/map'
import { useScrollProgress } from '@valley/ui/useScrollProgress'

type LogoProps = {
  className?: string
  withBrandName?: boolean
  withScrollAnimation?: boolean
} & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>

const Logo: React.FC<LogoProps> = ({
  withBrandName,
  withScrollAnimation,
  className,
  ...props
}) => {
  const scrollProgress = useScrollProgress(HEADER_HEIGHT)
  const topOffset = map(scrollProgress, 0, 1, 0, -32 * 0.2)
  const transformStyle = `scale(${map(scrollProgress, 0, 1, 1, 0.8)}) translateY(${topOffset}px) translateZ(0)`
  const style = useMemo<CSSProperties>(() => {
    if (!withScrollAnimation) return {}
    return {
      position: scrollProgress === 0 ? 'absolute' : 'fixed',
      transform: transformStyle,
    }
  }, [scrollProgress, transformStyle])

  return (
    <div {...props} className={cx(styles.logo, className)} style={style}>
      <svg
        width="32"
        height="32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20.7334 6.1329c-.7267-1.5105-2.8777-1.5105-3.6045 0l-2.4673 6.2067a2 2 0 0 0 .096 1.9105l8.0598 13.1803a2.0002 2.0002 0 0 0 1.7063.9566h5.2162c1.4735 0 2.4411-1.5393 1.8022-2.8671L20.7334 6.1329ZM7.1991 13.387c.7698-1.3334 2.6943-1.3334 3.4641 0l6.9282 12c.7698 1.3333-.1924 3-1.732 3H2.003c-1.5396 0-2.5019-1.6667-1.732-3l6.9281-12Z"
          fill="currentColor"
        />
      </svg>
      {withBrandName && (
        <svg
          width="91"
          height="32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M42.8702 7.5v18.9096h4.1677V7.5h-4.1677ZM50.6388 7.5v18.9096h4.1677V7.5h-4.1677Z"
            fill="currentColor"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M61.2126 25.696c1.2468.6116 2.6894.9174 4.328.9174 1.3002 0 2.449-.1868 3.4464-.5606.9975-.3908 1.8257-.943 2.4847-1.6565l-2.2175-2.2936c-.4809.4417-1.0152.773-1.603.9939-.5699.2208-1.2378.3313-2.0037.3313-.8549 0-1.603-.1444-2.2442-.4333-.6233-.3058-1.1131-.739-1.4694-1.2997-.1843-.3146-.3184-.6544-.4023-1.0194h10.8751c.0178-.1699.0357-.3483.0535-.5351.0178-.2039.0267-.3823.0267-.5352 0-1.4781-.3295-2.7439-.9885-3.7972-.659-1.0704-1.5585-1.8859-2.6984-2.4465-1.1221-.5777-2.3866-.8665-3.7937-.8665-1.4605 0-2.7696.3058-3.9273.9174-1.1577.5947-2.0749 1.4272-2.7518 2.4975-.659 1.0534-.9885 2.2681-.9885 3.6443 0 1.3592.3384 2.574 1.0153 3.6443.6768 1.0534 1.6297 1.8859 2.8586 2.4975Zm.2709-7.3396c.0693-.4247.2016-.8069.397-1.1468.3028-.5436.7213-.9599 1.2557-1.2487.5521-.3058 1.1844-.4587 1.8968-.4587.7125 0 1.3359.1529 1.8702.4587.5343.2888.9529.6966 1.2556 1.2232.201.3496.3353.7404.4029 1.1723h-7.0782Z"
            fill="currentColor"
          />
          <path
            d="M74.3328 31.2262c.7302.2208 1.4694.3312 2.2175.3312.8727 0 1.6653-.1274 2.3777-.3822.7303-.2549 1.3893-.6966 1.977-1.3252.6056-.6286 1.1399-1.4951 1.603-2.5994l6.4921-14.5517h-4.0075l-4.0603 9.3114-4.0347-9.3114h-4.3014l6.2226 13.8251-.0511.1149c-.285.6117-.6056 1.0449-.9618 1.2997-.3384.2719-.8015.4078-1.3892.4078-.4097 0-.8282-.0765-1.2557-.2294-.4096-.1529-.7748-.3652-1.0954-.6371l-1.5228 2.8288c.4631.3908 1.0598.6966 1.79.9175ZM14.1795 19.352 7.5409 7.6709H2l10.7161 18.7387h2.9268L26.359 7.6709h-5.5409L14.1795 19.352Z"
            fill="currentColor"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M39.5401 26.4096h-3.9807v-1.5801c-1.0331 1.1893-2.5292 1.7839-4.4884 1.7839-1.3536 0-2.5826-.2888-3.6868-.8664-1.0865-.5777-1.9414-1.4017-2.5648-2.472-.6234-1.0704-.9351-2.3106-.9351-3.7208 0-1.4101.3117-2.6504.9351-3.7207.6234-1.0704 1.4783-1.8944 2.5648-2.472 1.1042-.5777 2.3332-.8665 3.6868-.8665 1.8345 0 3.2683.5521 4.3013 1.6565v-1.4526h4.1678v13.7107Zm-7.7477-3.0582c1.0508 0 1.9235-.3398 2.6182-1.0194.6946-.6965 1.0419-1.6225 1.0419-2.7778s-.3473-2.0727-1.0419-2.7523c-.6947-.6966-1.5674-1.0449-2.6182-1.0449-1.0687 0-1.9503.3483-2.645 1.0449-.6946.6796-1.0419 1.597-1.0419 2.7523s.3473 2.0813 1.0419 2.7778c.6947.6796 1.5763 1.0194 2.645 1.0194Z"
            fill="currentColor"
          />
        </svg>
      )}
    </div>
  )
}

export default Logo
