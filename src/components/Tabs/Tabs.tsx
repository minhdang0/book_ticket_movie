import React, { Children, useEffect, useRef, useState } from 'react'
import Tab from './Tab';
import styles from './Tabs.module.scss';
import clsx from 'clsx';

type Props = {
    defaultIndex?: number,
    children?: React.ReactNode,
    onChange?: (index: number) => void
}

const Tabs: React.FC<Props> = ({ defaultIndex = 0, children, onChange }) => {
    const [currentIndex, setCurrentIndex] = useState(defaultIndex);
    const tabs = Children.toArray(children);
    const preIndex = useRef(defaultIndex);

    useEffect(() => {
        tabs.forEach((tab) => {
            if (React.isValidElement(tab) && tab.type !== Tab) throw Error('Only Tab')
        })
    }, [])

    useEffect(() => {
        if (preIndex.current !== currentIndex && typeof onChange === 'function') {
            onChange(currentIndex);
        }
        preIndex.current = currentIndex;

    }, [onChange, currentIndex])
    return (
        <div className='wrapper'>
            <div className="tabs__list">
                {tabs.map((tab, index) => {
                    if (!React.isValidElement(tab)) return null;

                    const tabElement = tab as React.ReactElement<{ title: string; onClick?: () => void }>; // <-- here

                    const active = currentIndex === index;
                    const date = tabElement.props.title.slice(0, 2);
                    const datePart = tabElement.props.title.slice(2);

                    return (
                        <button
                            key={index}
                            className={clsx(styles.btn__tab, {
                                [styles.active__btn]: active
                            })}
                            onClick={() => {
                                setCurrentIndex(index);
                                if (typeof tabElement.props.onClick === "function") tabElement.props.onClick();
                            }}
                        >
                            <span>{date}</span>{datePart}
                        </button>
                    );
                })}
            </div>
            <div className={styles.content__tab}>
                {tabs[currentIndex]}
            </div>
        </div>
    )
}

export default Tabs