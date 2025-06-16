import React, { Children, useEffect, useRef, useState } from 'react'
import SideTab from './SideTab';
import styles from './SideTab.module.scss';
import clsx from 'clsx';

type Props = {
    defaultIndex?: number,
    children?: React.ReactNode,
    onChange?: (index: number) => void,
}

const SideTabs: React.FC<Props> = ({ defaultIndex = 0, children, onChange }) => {
    const [currentIndex, setCurrentIndex] = useState(defaultIndex);
    const sideTabs = Children.toArray(children);
    const preIndex = useRef(defaultIndex);

    useEffect(() => {
        sideTabs.forEach((sideTab) => {
            if (React.isValidElement(sideTab) && sideTab.type !== SideTab) throw Error('Only Side Tab');
        })
    })

    useEffect(() => {
        if (preIndex.current !== currentIndex && typeof onChange === 'function') {
            onChange(currentIndex)
        }
        preIndex.current = currentIndex;
    }, [onChange, currentIndex])
    return (
        <div className={styles.wrapper}>
            <div className={styles.sideTab__list}>
                {sideTabs.map((sideTab, index) => {
                    if (!React.isValidElement(sideTab)) return null;

                    const sideTabElement = sideTab as React.ReactElement<{ title: string, onClick?: () => void }>;
                    const active = currentIndex === index;
                    const title = sideTabElement.props.title;

                    return (
                        <button
                            key={index}
                            className={clsx(styles.btn__sideTab, {
                                [styles.active__btn]: active
                            })}
                            onClick={() => {
                                setCurrentIndex(index);
                                if (typeof sideTabElement.props.onClick === 'function') sideTabElement.props.onClick();
                            }}><span>{title}</span></button>
                    )
                })}
            </div>
            <div className={styles.content_sideTab}>
                {sideTabs[currentIndex]}
            </div>
        </div>
    )
}

export default SideTabs;