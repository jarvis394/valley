import { Dropzone, FileInput } from '@valley/ui'
import { useRef } from 'react'

export function UploadDropzone({
  onFiles,
  disabled,
}: {
  onFiles: (files: File[]) => void
  disabled?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div className="w-full max-w-[500px]">
      <Dropzone
        variant="hero"
        label="Drop or upload files here"
        disabled={disabled}
        onFiles={onFiles}
        onClick={() => inputRef.current?.click()}
      />
      <FileInput ref={inputRef} multiple accept="image/*,video/*" onFiles={onFiles} />
    </div>
  )
}
