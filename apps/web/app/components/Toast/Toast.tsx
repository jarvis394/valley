import React, { useEffect } from 'react'
import { toast as showToast, Toaster as Sonner } from 'sonner'
import { type Toast } from '../../server/toast.server'

export const useToast = (toast?: Toast | null) => {
  useEffect(() => {
    if (toast) {
      setTimeout(() => {
        showToast[toast.type](toast.title, {
          id: toast.id,
          description: toast.description,
        })
      }, 0)
    }
  }, [toast])
}

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster: React.FC<ToasterProps> = ({ theme, ...props }) => {
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  )
}

export default Toaster
