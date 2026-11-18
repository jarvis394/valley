export function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="text-heading font-medium">Nothing here</h1>
      <p className="text-body text-white/50">This gallery doesn’t exist or isn’t public anymore.</p>
      <a href="/" className="mt-4 text-body text-white/80 underline underline-offset-4">
        Back to all galleries
      </a>
    </main>
  )
}
