'use client'
import Input from '@valley/ui/Input'
import React, { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import styles from '../auth.module.css'
import Button from '@valley/ui/Button'
import Spinner from '@valley/ui/Spinner'
import { useNavigate } from '@remix-run/react'
// import {
//   removeAuthTokensFromLocalStorage,
//   setAuthTokensToLocalStorage,
// } from '../../../utils/accessToken'
// import { authorizeUser } from '../../../api/auth'

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
  const navigate = useNavigate()

  const onSubmit: SubmitHandler<FieldValues> = async (
    { username, password },
    event
  ) => {
    event?.preventDefault()
    setIsLoading(true)
    // removeAuthTokensFromLocalStorage()

    try {
      // const res = await authorizeUser(username, password)
      // setAuthTokensToLocalStorage(res.tokens)
      navigate('/projects')
    } catch (e) {
      setIsLoading(false)
    }
  }

  return (
    <main className={styles.auth__content}>
      <h1 className={styles.auth__contentHeader}>Create your Valley account</h1>
      <form className={styles.auth__form} onSubmit={handleSubmit(onSubmit)}>
        <Input
          {...register('username', {
            required: true,
          })}
          state={errors.username ? 'error' : 'default'}
          size="lg"
          placeholder="Username"
          type="text"
        />
        <Input
          {...register('password', {
            required: true,
          })}
          state={errors.password ? 'error' : 'default'}
          size="lg"
          placeholder="Password"
          type="password"
        />
        <Button fullWidth variant="primary" disabled={isLoading} size="lg">
          {isLoading ? <Spinner /> : 'Register'}
        </Button>
      </form>
    </main>
  )
}

export default LoginPage
