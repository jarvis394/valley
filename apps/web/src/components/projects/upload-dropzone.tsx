import { cn, PlusIcon } from '@valley/ui'
import { useRef, useState, type DragEvent } from 'react'

export function UploadDropzone({
  onFiles,
  disabled,
}: {
  onFiles: (files: File[]) => void
  disabled?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const onDragOver = (event: DragEvent) => {
    if (!event.dataTransfer.types.includes('Files')) return
    event.preventDefault()
    setDragging(true)
  }
  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    const files = [...event.dataTransfer.files]
    if (files.length > 0) onFiles(files)
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex h-[228px] w-full max-w-[500px] flex-col items-center justify-center gap-4 rounded-[40px] border border-white/7 bg-canvas/80 px-6 py-4 text-white backdrop-blur-[16px] transition-[background-color,border-color,scale] duration-150 ease-out outline-none hover:bg-white/3 focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-99 disabled:opacity-40',
          dragging && 'scale-101 border-white/24 bg-white/5',
        )}
      >
        <PlusIcon className="size-5" />
        <span className="text-xl opacity-63">Drop or upload files here</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        hidden
        onChange={(event) => {
          const files = [...(event.target.files ?? [])]
          event.target.value = ''
          if (files.length > 0) onFiles(files)
        }}
      />
    </>
  )
}
