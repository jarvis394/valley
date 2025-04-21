'use client'

import Button from '@valley/ui/Button'
import Input from '@valley/ui/Input'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export default function Home() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    const username = e.currentTarget.username.value
    startTransition(() => {
      router.push('/' + username)
    })
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-xs flex-col items-center justify-center"
      >
        <h1 className="mb-4 text-2xl font-medium">@valley/gallery</h1>
        <Input
          name="username"
          size="lg"
          paperProps={{ className: 'self-center mb-2' }}
          placeholder="Search for a username"
        />
        <Button
          disabled={isPending}
          loading={isPending}
          type="submit"
          fullWidth
          size="lg"
        >
          {!isPending && 'Go to gallery'}
        </Button>
      </form>
    </div>
  )
}
