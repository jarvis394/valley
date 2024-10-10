'use client'
import React, { useMemo } from 'react'
import styles from './Gauge.module.css'
import { ViewportSize } from '../types/ViewportSize'
import cx from 'classnames'

type GaugeSize = Exclude<ViewportSize, 'xl'>
type GaugeProps = {
  value: number
  size?: GaugeSize
  arcPriority?: 'equal' | 'primary'
} & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>

type Variables = {
  circleProps: React.SVGProps<SVGCircleElement>
  circumference: number
  segmentGap: number
  primaryStrokePercent: number
  secondaryStrokePercent: number
  offsetFactor: number
}

const SVG_CIRCLE_SIZE = 100
const SEGMENTS_GAP: Record<GaugeSize, number> = {
  xs: 3,
  sm: 2,
  md: 1,
  lg: 1,
}
const SIZE_TO_CIRCLE_WIDTH: Record<GaugeSize, number> = {
  xs: 24,
  sm: 32,
  md: 64,
  lg: 128,
}

const Gauge: React.FC<GaugeProps> = ({
  value,
  size = 'sm',
  arcPriority,
  className,
  style,
  ...props
}) => {
  const circleSize = SIZE_TO_CIRCLE_WIDTH[size]
  const vars = useMemo<Variables>(() => {
    const strokeWidth = circleSize <= SIZE_TO_CIRCLE_WIDTH['xs'] ? 15 : 10
    const circleHalfSize = SVG_CIRCLE_SIZE / 2
    const radius = circleHalfSize - strokeWidth / 2
    const circumference = 2 * Math.PI * radius
    const segmentGap =
      Math.round((SVG_CIRCLE_SIZE / circumference) * strokeWidth) +
      SEGMENTS_GAP[size]
    const offsetFactor = 'equal' === arcPriority ? 0.5 : 0,
      primaryStrokePercent = value - 2 * segmentGap * offsetFactor,
      secondaryStrokePercent =
        SVG_CIRCLE_SIZE -
        value -
        2 * segmentGap * (1 - offsetFactor) -
        Math.max(1 - primaryStrokePercent, 0)
    return {
      circleProps: {
        cx: circleHalfSize,
        cy: circleHalfSize,
        r: radius,
        strokeWidth,
        strokeDashoffset: 0,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      },
      circumference,
      segmentGap,
      primaryStrokePercent,
      secondaryStrokePercent,
      offsetFactor,
    }
  }, [circleSize, size, arcPriority, value])

  return (
    <div
      {...props}
      className={cx(styles.gauge, className)}
      style={{
        ...style,
        ['--circle-size' as string]: '100px',
        ['--circumference' as string]: vars.circumference,
        ['--percent-to-px' as string]:
          vars.circumference / SVG_CIRCLE_SIZE + 'px',
        ['--gap-percent' as string]: vars.segmentGap,
        ['--offset-factor' as string]: vars.offsetFactor,
      }}
    >
      <svg
        fill="none"
        width={circleSize}
        height={circleSize}
        strokeWidth="2"
        viewBox={`0 0 ${SVG_CIRCLE_SIZE} ${SVG_CIRCLE_SIZE}`}
      >
        <circle
          {...vars.circleProps}
          className={styles.gauge__arcSecondary}
          stroke="var(--alpha-transparent-12)"
          style={{
            opacity: 1,
            ['--stroke-percent' as string]: vars.secondaryStrokePercent,
          }}
        />
        <circle
          {...vars.circleProps}
          className={styles.gauge__arcPrimary}
          stroke="var(--blue-600)"
          style={{
            opacity: 1,
            ['--stroke-percent' as string]: vars.primaryStrokePercent,
          }}
        />
      </svg>
    </div>
  )
}

export default React.memo(Gauge)
