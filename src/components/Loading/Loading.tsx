import React from 'react';
import styles from './Loading.module.scss'


const Loading: React.FC = () => {
    return (
        <div className={styles.loading__overlay}>
            <div className={styles.loading__spin}></div>
            {/* <p className={styles.loading__text}>Đang tải...</p> */}
        </div>
    );
}

export default Loading