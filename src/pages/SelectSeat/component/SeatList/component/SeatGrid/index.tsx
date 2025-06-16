import React from 'react';

import styles from './SeatGrid.module.scss';
import { ISeat } from '../../../../../../utils/interfaces/seat';
import SeatButton from '../SeatButton';

interface SeatGridProps {
    seats: ISeat[];
    selectedSeats: string[];
    occupiedSeats: Set<string>;
    isLoading: boolean;
    onSeatToggle: (seatName: string) => void;
}

const SeatGrid: React.FC<SeatGridProps> = ({
    seats,
    selectedSeats,
    occupiedSeats,
    isLoading,
    onSeatToggle
}) => {
    const getRowsFromSeats = () => {
        const rows = [...new Set(seats.map(seat => seat.name.charAt(0)))].sort();
        return rows.map(row => ({
            row,
            seats: seats.filter(seat => seat.name.startsWith(row)).sort((a, b) => {
                const numA = parseInt(a.name.slice(1));
                const numB = parseInt(b.name.slice(1));
                return numA - numB;
            })
        }));
    };

    const groupedSeats = getRowsFromSeats();
    const lastRow = groupedSeats[groupedSeats.length - 1]?.row;

    return (
        <>
            <div className={styles.screen}>MÀN HÌNH CHIẾU</div>

            {groupedSeats.map(group => {
                const isLastRow = group.row === lastRow;
                return (
                    <div
                        key={group.row}
                        className={`${styles.seats} ${isLastRow ? styles.coupleRow : ''}`}
                    >
                        {group.seats.map(seat => (
                            <SeatButton
                                key={seat._id}
                                seat={seat}
                                isSelected={selectedSeats.includes(seat.name)}
                                isOccupiedByOther={occupiedSeats.has(seat._id)}
                                isCoupleSeat={isLastRow}
                                isLoading={isLoading}
                                onToggle={onSeatToggle}
                            />
                        ))}
                    </div>
                );
            })}
        </>
    );
};

export default SeatGrid;