import { useSearchParams } from 'react-router'
import type { RelativeRoutingType } from 'react-router'
import { ModalId } from 'app/components/Modals'

interface NavigateOptions {
  replace?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state?: any
  preventScrollReset?: boolean
  relative?: RelativeRoutingType
  flushSync?: boolean
  viewTransition?: boolean
}

export const useModal = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  return {
    openModal: (
      modalId: ModalId,
      modalProps?: Record<string, string>,
      navigateProps?: NavigateOptions
    ) => {
      const params = new URLSearchParams(searchParams.toString())

      params.set('modal', modalId)
      for (const key in modalProps) {
        params.set('modal-' + key, modalProps[key].toString())
      }

      setSearchParams(params, {
        preventScrollReset: true,
        viewTransition: false,
        ...navigateProps,
      })
    },
  }
}
