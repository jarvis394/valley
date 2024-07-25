import React from 'react'
import Button from '../components/Button/Button'

const page = () => {
  return (
    <div
      style={{ display: 'flex', gap: 8, flexDirection: 'column', padding: 16 }}
    >
      <Button size="sm">Label</Button>
      <Button size="md">Label</Button>
      <Button size="lg">Label</Button>
      <Button size="sm" disabled>
        Label
      </Button>
      <Button size="md" disabled>
        Label
      </Button>
      <Button size="lg" disabled>
        Label
      </Button>
      <Button variant="tertiary" size="sm">
        Label
      </Button>
      <Button variant="tertiary" size="md">
        Label
      </Button>
      <Button variant="tertiary" size="lg">
        Label
      </Button>
      <Button variant="secondary" size="sm">
        Label
      </Button>
      <Button variant="secondary" size="md">
        Label
      </Button>
      <Button variant="secondary" size="lg">
        Label
      </Button>
      <Button variant="secondary-dimmed" size="sm">
        Label
      </Button>
      <Button variant="secondary-dimmed" size="md">
        Label
      </Button>
      <Button variant="secondary-dimmed" size="lg">
        Label
      </Button>
      <Button variant="warning" size="sm">
        Label
      </Button>
      <Button variant="warning" size="md">
        Label
      </Button>
      <Button variant="warning" size="lg">
        Label
      </Button>
      <Button variant="danger" size="sm">
        Label
      </Button>
      <Button variant="danger" size="md">
        Label
      </Button>
      <Button variant="danger" size="lg">
        Label
      </Button>
    </div>
  )
}

export default page
