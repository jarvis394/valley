import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Valley',
  description: 'Platform for your photography sessions',
}

export default function Home() {
  return (
    <div
      style={{ padding: 16, gap: 16, display: 'flex', flexDirection: 'column' }}
    >
      <h1>Testing!</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}></div>
    </div>
  )
}
