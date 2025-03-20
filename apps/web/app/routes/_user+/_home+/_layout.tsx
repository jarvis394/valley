import React from 'react'
import { Outlet } from 'react-router'
import UserHomeToolbar from 'app/components/Toolbar/UserHomeToolbar'

export const shouldRevalidate = () => {
  return false
}

const Layout: React.FC = () => {
  return (
    <>
      <UserHomeToolbar />
      <Outlet />
    </>
  )
}

export default Layout
