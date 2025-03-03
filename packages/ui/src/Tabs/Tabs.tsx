import React, {
  CSSProperties,
  JSX,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { isFragment } from 'react-is'
import styles from './Tabs.module.css'
import { TabsItemProps } from '../TabsItem/TabsItem'
import { useScrollProgress } from '../useScrollProgress/useScrollProgress'
import cx from 'classnames'

const HOVER_CONTAINER_PADDING = 8
const ANIMATION_DURATION = 150
const TRANSITION_OPACITY = `opacity ${ANIMATION_DURATION}ms`
const TRANSITION_FULL = [
  `opacity ${ANIMATION_DURATION}ms`,
  `transform ${ANIMATION_DURATION}ms`,
  `width ${ANIMATION_DURATION}ms`,
].join(', ')

type TabValue = string | number | undefined

type BaseTabsProps<T extends TabValue> = {
  onItemClick?: (
    value: T,
    event: React.MouseEvent<HTMLElement, MouseEvent>
  ) => void
  indicator?: boolean
  children:
    | React.ReactElement<TabsItemProps>
    | Array<React.ReactElement<TabsItemProps>>
  className?: string
  scrollProgressOffset?: number
  scrollProgressTransitionStyles?: (progress: number) => CSSProperties
}

type ValueProps<T extends TabValue> =
  | {
      value: T
      defaultValue?: never
    }
  | {
      defaultValue: T
      value?: never
    }

export type TabsProps<T extends TabValue = TabValue> = BaseTabsProps<T> &
  ValueProps<T>

const Tabs = <T extends TabValue = TabValue>({
  onItemClick,
  children: childrenProp,
  value: propsValue,
  defaultValue,
  indicator,
  className,
  ...props
}: TabsProps<T>): JSX.Element => {
  const [innerValue, setInnerValue] = useState(defaultValue)
  const scrollProgress = useScrollProgress(props.scrollProgressOffset || 0, {
    enabled: props.scrollProgressOffset !== undefined,
  })
  const scrollProgressTransitionStyles =
    props.scrollProgressTransitionStyles?.(scrollProgress)
  const value = useMemo(
    () => (propsValue !== undefined ? propsValue : innerValue),
    [innerValue, propsValue]
  )
  const [mounted, setMounted] = useState(false)
  const tabsRefs = useRef(new Map<T, HTMLElement>())
  const [hoveredTab, setHoveredTab] = useState<T | null>(null)
  const initialHoveredElementTimeoutRef = useRef<NodeJS.Timeout>(undefined)
  /** Removes transform animation from selected item indicator on first render */
  const [isInitialSelectedAppear, setIsInitialSelectedAppear] = useState(true)
  const $root = useRef<HTMLDivElement>(null)
  const rootBoundingRect = $root.current?.getBoundingClientRect()
  const [isInitialHoveredElement, setIsInitialHoveredElement] = useState(true)
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null)
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(
    null
  )

  const onLeaveTabs = () => {
    startTransition(() => {
      setHoveredTab(null)
      initialHoveredElementTimeoutRef.current = setTimeout(() => {
        setIsInitialHoveredElement(true)
      }, ANIMATION_DURATION)
    })
  }

  const onEnterTab = useCallback((value: T, e: React.PointerEvent) => {
    startTransition(() => {
      // Do not show hover indicator when on mobile (client is using touch)
      if (e.pointerType === 'touch') return
      if (!e.target || !(e.target instanceof HTMLElement)) return

      setHoveredTab((prev) => {
        if (prev !== null && prev !== value) {
          setIsInitialHoveredElement(false)
        }

        return value
      })

      setHoveredElement(e.target)
    })
  }, [])

  const handleItemClick = useCallback(
    (itemValue: T, e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      startTransition(() => {
        onItemClick?.(itemValue, e)
        setInnerValue(itemValue)
        setSelectedElement(e.currentTarget)
        setIsInitialSelectedAppear(false)
      })
    },
    [onItemClick]
  )

  const children = useMemo(() => {
    let childIndex = 0

    return React.Children.map(childrenProp, (child) => {
      if (!React.isValidElement<TabsItemProps>(child)) {
        return null
      }

      if (process.env.NODE_ENV !== 'production') {
        if (isFragment(child)) {
          console.error(
            [
              'Tabs component does not accept a Fragment as a child.',
              'Consider providing an array instead.',
            ].join('\n')
          )
        }
      }

      const childValue = (
        child.props.value === undefined ? childIndex : child.props.value
      ) as T
      const childSelected = child.props.selected
      const selected = childSelected || childValue === value

      childIndex += 1

      return React.cloneElement<
        TabsItemProps & Omit<React.ComponentProps<'button'>, 'onClick'>
      >(child, {
        indicator: selected && !mounted && indicator,
        selected,
        onClick: handleItemClick as (value: string | number) => void,
        value: childValue,
        ref: (e) => {
          if (!e) return
          tabsRefs.current.set(childValue, e)
          if (selected) {
            setSelectedElement(e)
          }
        },
        onPointerEnter: onEnterTab.bind(null, childValue),
      })
    })
  }, [childrenProp, handleItemClick, indicator, mounted, onEnterTab, value])

  const hoverStyles: CSSProperties = { opacity: 0 }
  const hoveredRect = hoveredElement?.getBoundingClientRect()
  if (rootBoundingRect && hoveredRect) {
    hoverStyles.transform = `translate3d(${
      hoveredRect.left - rootBoundingRect.left
    }px,${
      hoveredRect.top - rootBoundingRect.top + HOVER_CONTAINER_PADDING
    }px,0px)`
    hoverStyles.width = hoveredRect.width
    hoverStyles.height = hoveredRect.height - HOVER_CONTAINER_PADDING * 2
    hoverStyles.opacity = hoveredTab !== null ? 1 : 0
    hoverStyles.transition = isInitialHoveredElement
      ? TRANSITION_OPACITY
      : TRANSITION_FULL
  }

  const selectStyles: CSSProperties = { opacity: 0 }
  const selectedRect = selectedElement?.getBoundingClientRect()
  if (rootBoundingRect && selectedRect) {
    selectStyles.width = selectedRect.width
    selectStyles.transform = `translateX(${
      (selectedRect.left || 0) - rootBoundingRect.left
    }px)`
    selectStyles.opacity = 1
    selectStyles.transition = isInitialSelectedAppear
      ? TRANSITION_OPACITY
      : TRANSITION_FULL
  }

  useEffect(() => {
    startTransition(() => {
      setMounted(true)
    })

    return () => {
      clearTimeout(initialHoveredElementTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    tabsRefs.current = new Map()
  }, [children.length])

  return (
    <div
      onPointerLeave={onLeaveTabs}
      ref={$root}
      className={cx(styles.tabs, className)}
      style={scrollProgressTransitionStyles}
    >
      {children}
      <div className={styles.tabs__hover} style={hoverStyles} />
      <div className={styles.tabs__indicator} style={selectStyles} />
    </div>
  )
}

export default React.memo(Tabs)
