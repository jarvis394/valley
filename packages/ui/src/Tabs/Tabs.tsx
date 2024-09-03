'use client'
import React, {
  CSSProperties,
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

const HOVER_CONTAINER_PADDING = 8

type BaseTabsProps<T extends string | number> = {
  onItemClick?: (
    value: T,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void
  indicator?: boolean
  children:
    | React.ReactElement<TabsItemProps>
    | Array<React.ReactElement<TabsItemProps>>
  scrollProgressOffset?: number
  scrollProgressTransitionStyles?: (progress: number) => CSSProperties
}

type ValueProps<T extends string | number> =
  | {
      value: T
      defaultValue?: never
    }
  | {
      defaultValue: T
      value?: never
    }

export type TabsProps<T extends string | number = string | number> =
  BaseTabsProps<T> & ValueProps<T>

const Tabs = <T extends string | number = string | number>({
  onItemClick,
  children: childrenProp,
  value: propsValue,
  defaultValue,
  indicator,
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
  const buttonRefs = useRef(new Map<T, HTMLButtonElement>())
  const [hoveredTab, setHoveredTab] = useState<T | null>(null)
  const initialHoveredElementTimeoutRef = useRef<NodeJS.Timeout>()
  const $root = useRef<HTMLDivElement>(null)
  const rootBoundingRect = $root.current?.getBoundingClientRect()
  const [isInitialHoveredElement, setIsInitialHoveredElement] = useState(true)
  const isInitialRender = useRef(true)
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null)
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(
    null
  )

  const onLeaveTabs = () => {
    setHoveredTab(null)
    initialHoveredElementTimeoutRef.current = setTimeout(() => {
      setIsInitialHoveredElement(true)
    }, 150)
  }

  const onEnterTab = useCallback(
    (
      e:
        | React.PointerEvent<HTMLButtonElement>
        | React.FocusEvent<HTMLButtonElement>,
      value: T
    ) => {
      if (!e.target || !(e.target instanceof HTMLButtonElement)) return

      setHoveredTab((prev) => {
        if (prev !== null && prev !== value) {
          setIsInitialHoveredElement(false)
        }

        return value
      })

      setHoveredElement(e.target)
    },
    []
  )

  const handleItemClick = useCallback(
    (itemValue: T, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      onItemClick?.(itemValue, e)
      setInnerValue(itemValue)
      setSelectedElement(e.currentTarget)
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
      const selected = childValue === value

      childIndex += 1

      return React.cloneElement(child, {
        indicator: selected && !mounted && indicator,
        selected,
        onClick: (
          value: string | number,
          event: React.MouseEvent<HTMLButtonElement, MouseEvent>
        ) => {
          handleItemClick(value as T, event)
        },
        value: childValue,
        ref: (e: HTMLButtonElement) => {
          buttonRefs.current.set(childValue, e)
          if (selected) {
            setSelectedElement(e)
          }
        },
        onPointerEnter: (
          e:
            | React.PointerEvent<HTMLButtonElement>
            | React.FocusEvent<HTMLButtonElement, Element>
        ) => onEnterTab(e, childValue),
        onFocus: (
          e:
            | React.PointerEvent<HTMLButtonElement>
            | React.FocusEvent<HTMLButtonElement, Element>
        ) => onEnterTab(e, childValue),
      })
    })
  }, [childrenProp, handleItemClick, indicator, mounted, onEnterTab, value])

  const hoverStyles: CSSProperties = { opacity: 0 }
  const hoveredRect = hoveredElement?.getBoundingClientRect()
  if (rootBoundingRect && hoveredRect) {
    hoverStyles.transform = `translate3d(${
      hoveredRect.left - rootBoundingRect.left
    }px,${hoveredRect.top - rootBoundingRect.top + HOVER_CONTAINER_PADDING}px,0px)`
    hoverStyles.width = hoveredRect.width
    hoverStyles.height = hoveredRect.height - HOVER_CONTAINER_PADDING * 2
    hoverStyles.opacity = hoveredTab !== null ? 1 : 0
    hoverStyles.transition = isInitialHoveredElement
      ? 'opacity 150ms'
      : 'transform 150ms, opacity 150ms, width 150ms'
  }

  const selectStyles: CSSProperties = { opacity: 0 }
  const selectedRect = selectedElement?.getBoundingClientRect()
  if (rootBoundingRect && selectedRect) {
    selectStyles.width = selectedRect.width
    selectStyles.transform = `translateX(${
      (selectedRect.left || 0) - rootBoundingRect.left
    }px)`
    selectStyles.opacity = 1
    selectStyles.transition = isInitialRender.current
      ? 'opacity 150ms'
      : 'transform 150ms 0ms, opacity 150ms, width 150ms'

    isInitialRender.current = false
  }

  useEffect(() => {
    setMounted(true)

    return () => {
      clearTimeout(initialHoveredElementTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    buttonRefs.current = new Map()
  }, [children.length])

  return (
    <div
      onPointerLeave={onLeaveTabs}
      ref={$root}
      className={styles.tabs}
      style={scrollProgressTransitionStyles}
    >
      {children}
      <div className={styles.tabs__hover} style={hoverStyles} />
      <div className={styles.tabs__indicator} style={selectStyles} />
    </div>
  )
}

export default React.memo(Tabs)
