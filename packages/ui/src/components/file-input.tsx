import type { ComponentProps } from 'react'

/** Hidden file input; a control opens it with `ref.current?.click()`. */
export function FileInput({
  onFiles,
  ...props
}: Omit<ComponentProps<'input'>, 'type' | 'className' | 'onChange' | 'children'> & {
  onFiles: (files: File[]) => void
}) {
  return (
    <input
      type="file"
      tabIndex={-1}
      hidden
      {...props}
      onChange={(event) => {
        const input = event.currentTarget
        const files = [...(input.files ?? [])]
        // Cleared so picking the same file again still fires a change.
        input.value = ''
        if (files.length > 0) onFiles(files)
      }}
    />
  )
}
