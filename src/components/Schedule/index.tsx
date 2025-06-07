import React from 'react';
import Tabs from '../Tabs/Tabs';
import Tab from '../Tabs/Tab';
import styles from './Schedule.module.scss';
import { IShowtime } from '../../utils/interfaces/showtime';
import { formatDate } from '../../utils/format/formatDate';

type Props = {
    showtimeData: IShowtime[];
    onSelectShowtime: (show: IShowtime) => void;
};

const Schedule: React.FC<Props> = ({ showtimeData, onSelectShowtime }) => {
    console.log(showtimeData)
    const groupedShowtime = showtimeData.reduce((acc: Record<string, IShowtime[]>, show) => {
        const date = new Date(show.date).toISOString().split('T')[0]; // YYYY-MM-DD
        if (!acc[date]) acc[date] = [];
        acc[date].push(show);
        return acc;
    }, {});

    const dates = Object.keys(groupedShowtime).sort();

    return (
        <Tabs defaultIndex={0}>
            {dates.map((date, index) => (
                <Tab key={index} title={formatDate(date)}>
                    <div className={styles.showtime__list}>
                        {groupedShowtime[date].map((show, idx) => (
                            <div key={idx} className={styles.showtime__item}>
                                <button
                                    onClick={() => onSelectShowtime(show)}
                                    disabled={show.availableSeats <= 0}
                                >
                                    {show.time}
                                </button>
                                <p>{show.availableSeats} ghế trống</p>
                            </div>
                        ))}
                    </div>
                </Tab>
            ))}
        </Tabs>
    );
};

export default Schedule;
