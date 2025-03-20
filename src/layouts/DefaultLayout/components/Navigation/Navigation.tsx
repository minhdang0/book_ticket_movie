import React from 'react'
import { NavLink } from 'react-router-dom'
import routes from '../../../../routes'
import styles from './Navigation.module.scss';

type Props = {}

const Navigation:React.FC<Props> = () => {
  return (
    <>
        <nav className={styles.nav__container}>
            <ul>
                {routes.map((route) => {
                    return <li key={route.path}>
                      <NavLink 
                      className={({isActive})=> isActive ? styles.active: ""} 
                      to={route.path}>{route.name}
                      </NavLink>
                      </li>
                })}
            </ul>
        </nav>
    </>
  )
}

export default Navigation