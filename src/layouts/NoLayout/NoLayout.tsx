import React from 'react'
import { Outlet } from 'react-router-dom'


const NoLayout:React.FC = () => {
  return (
    <>
        <Outlet/>
    </>
  )
}

export default NoLayout