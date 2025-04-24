import React from 'react';
import Tabs from '../Tabs/Tabs';
import Tab from '../Tabs/Tab';
import styles from './Schedule.module.scss';

import { ShowtimeDay } from '../../utils/interfaces/showtime';

type Props = {
    showtimeData: ShowtimeDay[];
    onSelectShowtime: (day: string, time: string) => void;
};

const Schedule: React.FC<Props> = ({ showtimeData, onSelectShowtime }) => {
    return (
        <Tabs defaultIndex={0}>
            {showtimeData.map((day, index) => (
                <Tab key={index} title={day.showDate.date}>
                    <div className={styles.showtime__list}>
                        {day.showDate.showtime.map((show, idx) => (
                            <div key={idx} className={styles.showtime__item}>
                                <button
                                    onClick={() => onSelectShowtime(day.showDate.date, show.time)}
                                    disabled={show.availableSeats <= 0}
                                >
                                    {show.time}
                                </button>
                                <p>{show.availableSeats} ghế trống</p>
                            </div>
                        ))}
                    </div>
                </Tab>

            ))
            }
        </Tabs >
    );
};

export default Schedule;
