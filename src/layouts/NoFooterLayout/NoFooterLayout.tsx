import React from 'react'
import Header from '../components/Header/Header'
import { Outlet } from 'react-router-dom';
import styles from './NoFooterLayout.module.scss'
type Props = {}

const NoFooterLayout: React.FC<Props> = () => {
    return (
        <>
            <Header />
            <main className={styles.content}>
                <Outlet />
            </main>
        </>
    )
}

export default NoFooterLayout