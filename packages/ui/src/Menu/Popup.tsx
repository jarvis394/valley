// This code has been adapted from @mui/base
// to fix https://github.com/mui/material-ui/pull/41007
// TODO: remove, when fixed in @mui/base

import * as React from 'react'
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
  VirtualElement,
} from '@floating-ui/react-dom'
import {
  unstable_useEnhancedEffect as useEnhancedEffect,
  unstable_useForkRef as useForkRef,
} from '@mui/utils'
import { unstable_composeClasses as composeClasses } from '@mui/base/composeClasses'
import { Portal } from '@mui/base/Portal'
import {
  useSlotProps,
  WithOptionalOwnerState,
  PolymorphicComponent,
} from '@mui/base/utils'
import { useClassNamesOverride } from '@mui/base/utils/ClassNameConfigurator'
import { getPopupUtilityClass } from '@mui/base/Unstable_Popup/popupClasses'
import {
  PopupOwnerState,
  PopupProps,
  PopupRootSlotProps,
  PopupTypeMap,
} from '@mui/base/Unstable_Popup/Popup.types'
import { useTransitionTrigger } from './useTransitionTrigger'
import { TransitionContext } from '@mui/base/useTransition/TransitionContext'
import {
  PopupContext,
  PopupContextValue,
} from '@mui/base/Unstable_Popup/PopupContext'

function useUtilityClasses(ownerState: PopupOwnerState) {
  const { open } = ownerState

  const slots = {
    root: ['root', open && 'open'],
  }

  return composeClasses(slots, useClassNamesOverride(getPopupUtilityClass))
}

function resolveAnchor(
  anchor:
    | VirtualElement
    | (() => VirtualElement)
    | HTMLElement
    | (() => HTMLElement)
    | null
    | undefined
): HTMLElement | VirtualElement | null | undefined {
  return typeof anchor === 'function' ? anchor() : anchor
}

/**
 *
 * Demos:
 *
 * - [Popup](https://mui.com/base-ui/react-popup/)
 *
 * API:
 *
 * - [Popup API](https://mui.com/base-ui/react-popup/components-api/#popup)
 */
const Popup = React.forwardRef(function Popup<
  RootComponentType extends React.ElementType
>(
  props: PopupProps<RootComponentType>,
  forwardedRef: React.ForwardedRef<Element>
) {
  const {
    anchor: anchorProp,
    children,
    container,
    disablePortal = false,
    keepMounted = false,
    middleware,
    offset: offsetProp = 0,
    open = false,
    placement = 'bottom',
    slotProps = {},
    slots = {},
    strategy = 'absolute',
    ...other
  } = props

  const {
    refs,
    elements,
    floatingStyles,
    update,
    placement: finalPlacement,
  } = useFloating({
    elements: {
      reference: resolveAnchor(anchorProp),
    },
    open,
    middleware: middleware ?? [offset(offsetProp ?? 0), flip(), shift()],
    placement,
    strategy,
    whileElementsMounted: !keepMounted ? autoUpdate : undefined,
  })

  const handleRef = useForkRef(refs.setFloating, forwardedRef)

  useEnhancedEffect(() => {
    if (keepMounted && open && elements.reference && elements.floating) {
      const cleanup = autoUpdate(elements.reference, elements.floating, update)
      return cleanup
    }

    return undefined
  }, [keepMounted, open, elements, update])

  const ownerState: PopupOwnerState = {
    ...props,
    disablePortal,
    keepMounted,
    offset,
    open,
    placement,
    finalPlacement,
    strategy,
  }

  const { contextValue, hasExited: hasTransitionExited } =
    useTransitionTrigger(open)

  const visibility = keepMounted && hasTransitionExited ? 'hidden' : undefined
  const classes = useUtilityClasses(ownerState)

  const Root = slots?.root ?? 'div'
  const rootProps: WithOptionalOwnerState<PopupRootSlotProps> = useSlotProps({
    elementType: Root,
    externalSlotProps: slotProps.root,
    externalForwardedProps: other,
    ownerState,
    className: classes.root,
    additionalProps: {
      ref: handleRef,
      role: 'tooltip',
      style: { ...floatingStyles, visibility },
    },
  })

  const popupContextValue: PopupContextValue = React.useMemo(
    () => ({
      placement: finalPlacement,
    }),
    [finalPlacement]
  )

  const shouldRender = keepMounted || !hasTransitionExited
  if (!shouldRender) {
    return null
  }

  return (
    <Portal disablePortal={disablePortal} container={container}>
      <PopupContext.Provider value={popupContextValue}>
        <TransitionContext.Provider value={contextValue}>
          <Root {...rootProps}>{children}</Root>
        </TransitionContext.Provider>
      </PopupContext.Provider>
    </Portal>
  )
}) as PolymorphicComponent<PopupTypeMap>

export { Popup }
