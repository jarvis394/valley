'use client'
import Input from '@app/components/Input/Input'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import styles from '../../styles.module.css'
import Button from '@app/components/Button/Button'
import Spinner from '@app/components/Spinner/Spinner'
import {
  autorizeUser,
  removeAuthTokensFromLocalStorage,
  setAuthTokensToLocalStorage,
} from '@lib/features/auth/utils'

type FieldValues = {
  username: string
  password: string
}

const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>()
  const router = useRouter()

  const onSubmit: SubmitHandler<FieldValues> = async (
    { username, password },
    event
  ) => {
    event.preventDefault()
    setIsLoading(true)
    removeAuthTokensFromLocalStorage()

    try {
      const res = await autorizeUser(username, password)
      setAuthTokensToLocalStorage(res.tokens)
      router.push('/projects')
    } catch (e) {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.auth__content}>
      <h1 className={styles.auth__contentHeader}>Log in to Valley</h1>
      <form className={styles.auth__form} onSubmit={handleSubmit(onSubmit)}>
        <Input
          {...register('username', {
            required: true,
          })}
          state={errors.username ? 'error' : 'default'}
          inputSize="lg"
          placeholder="Username"
          type="text"
        />
        <Input
          {...register('password', {
            required: true,
          })}
          state={errors.password ? 'error' : 'default'}
          inputSize="lg"
          placeholder="Password"
          type="password"
        />
        <Button fullWidth variant="primary" disabled={isLoading} size="lg">
          {isLoading ? <Spinner /> : 'Login'}
        </Button>
      </form>
    </div>
  )
}

export default LoginPage
