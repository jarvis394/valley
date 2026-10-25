import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

const getServerTime = createServerFn({ method: 'GET' }).handler(() => new Date().toISOString())

export const Route = createFileRoute('/')({
  loader: () => getServerTime(),
  component: Home,
})

function Home() {
  const serverTime = Route.useLoaderData()

  return (
    <>
      <h1>Valley</h1>
      <p>
        Rendered on the server at <time dateTime={serverTime}>{serverTime}</time>
      </p>
    </>
  )
}
