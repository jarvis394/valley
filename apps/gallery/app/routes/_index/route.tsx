import React from 'react'
import type { MetaFunction } from '@remix-run/node'
import styles from './Index.module.css'
import Input from '@valley/ui/Input'
import Button from '@valley/ui/Button'
import { useNavigate, useNavigation } from '@remix-run/react'

export const meta: MetaFunction = () => {
  return [
    { title: 'Gallery' },
    { name: 'description', content: 'Gallery for a Valley project' },
  ]
}

export default function Index() {
  const navigate = useNavigate()
  const navigation = useNavigation()
  const isLoading = navigation.state === 'loading'

  return (
    <div className={styles.Index}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const username = e.currentTarget.username.value
          navigate('/' + username)
        }}
        className={styles.Index__container}
      >
        <h2>@valley/gallery</h2>
        <Input
          name="username"
          size="lg"
          paperProps={{ className: styles.Index__input }}
          placeholder="Search for a username"
        />
        <Button
          disabled={isLoading}
          loading={isLoading}
          type="submit"
          fullWidth
          size="lg"
        >
          {!isLoading && 'Go to gallery'}
        </Button>
      </form>
    </div>
  )
}
