import React, { useEffect } from 'react'
import { useNavigate } from 'react-router'

type RedirectProps = {
  to: string
}

const Redirect: React.FC<RedirectProps> = ({ to }) => {
  const navigate = useNavigate()

  useEffect(() => {
    navigate(to)
  }, [navigate, to])

  return null
}

export default Redirect
