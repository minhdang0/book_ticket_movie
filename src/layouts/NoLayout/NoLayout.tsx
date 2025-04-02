import React from 'react'
import { Outlet } from 'react-router-dom'
import styles from './NoLayout.module.scss'


const NoLayout: React.FC = () => {
  return (
    <main className={styles.content__layout} >
      <Outlet />
    </main>
  )
}

export default NoLayout