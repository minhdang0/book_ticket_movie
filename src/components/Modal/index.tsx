import React, { useEffect } from 'react';
import styles from './Modal.module.scss';

type Props = {
    isOpen: boolean,
    onCLose: (e: React.MouseEvent<HTMLButtonElement>) => void,
    children: React.ReactNode,
}

const Modal: React.FC<Props> = ({ isOpen, children, onCLose }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        }
    }, [isOpen])

    if (!isOpen) return null;
    return (
        <div className={styles.modal__overlay}>
            <div className={styles.modal__content}>
                <button className={styles.closeButton} onClick={onCLose}>&times;</button>
                {children}
            </div>
        </div>
    )
}

export default Modal;