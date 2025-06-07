import React from "react";
import clsx from 'clsx';
import styles from './Button.module.scss'

type Props = {
    children: React.ReactNode,
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void,
    className?: string,
    primary?: boolean,
    secondary?: boolean,
    warning?: boolean,
    size?: 'large' | 'small' | 'medium',
    disabled?: boolean,
};

const Button = ({
    children,
    onClick,
    primary,
    secondary,
    warning,
    size,
    disabled,
    className,
}: Props) => {

    return (
        <button onClick={onClick} className={clsx(styles.btn, {
            [styles.primary]: primary,
            [styles.secondary]: secondary,
            [styles.warning]: warning,
            [styles.size]: ['small', 'medium', 'large'].includes(size ?? '')
        }, className)}
            disabled={disabled}
        >
            <span>{children}</span>
        </button>
    )
};

export default Button;
