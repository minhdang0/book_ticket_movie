import React, { useEffect, useState } from 'react';
import styles from './SeatList.module.scss';
import { ISeat } from '../../../../utils/interfaces/seat';
import { seatData } from '../../../../utils/data/seatData';
import { seatTypeData } from '../../../../utils/data/seatTypeData';


const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

type Props = {
    selectedSeats: string[];
    setSelectedSeats: React.Dispatch<React.SetStateAction<string[]>>;
    roomId: number; 
};

const SeatList: React.FC<Props> = ({ selectedSeats, setSelectedSeats, roomId }) => {
    const [seats, setSeats] = useState<ISeat[]>([]);
    const [countdown, setCountdown] = useState<number>(600);

    useEffect(() => {
        const filteredSeats = seatData.filter(seat => seat.roomId === roomId);
        setSeats(filteredSeats);
    }, [roomId]);

    const toggleSeat = (seatName: string) => {
        const seatIndex = seats.findIndex(seat => seat.name === seatName);
        const selectedSeat = seats[seatIndex];

        if (!selectedSeat || selectedSeat.isBooked) return;

        let updatedSelectedSeats = [...selectedSeats];
        if (selectedSeats.includes(seatName)) {
            updatedSelectedSeats = updatedSelectedSeats.filter(name => name !== seatName);
        } else {
            updatedSelectedSeats.push(seatName);
        }

        setSelectedSeats(updatedSelectedSeats);
    };

    const getPrice = (typeId: number) => {
        const seatType = seatTypeData.find(t => t.id === typeId);
        return seatType?.price || 0;
    };

    const totalPrice = selectedSeats.reduce((sum, name) => {
        const seat = seats.find(s => s.name === name);
        return seat ? sum + getPrice(seat.typeId) : sum;
    }, 0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const groupedSeats = rows.map(row => ({
        row,
        seats: seats.filter(seat => seat.name.startsWith(row)),
    }));

    return (
        <div className={styles.cinema}>
            <div className={styles.legend}>
                <span className={`${styles.seat} ${styles.available}`} /> Ghế trống
                <span className={`${styles.seat} ${styles.selected}`} /> Ghế đang chọn
                <span className={`${styles.seat} ${styles.sold}`} /> Ghế đã bán
            </div>

            <div className={styles.screen}>MÀN HÌNH CHIẾU</div>

            {groupedSeats.map(group => (
                <div
                    key={group.row}
                    className={`${styles.seats} ${group.row === 'J' ? styles.coupleSeats : styles.normalSeats}`}
                >
                    {group.seats.map(seat => {
                        const isSelected = selectedSeats.includes(seat.name);
                        const seatType = seatTypeData.find(t => t.id === seat.typeId);
                        return (
                            <button
                                key={seat.name}
                                className={`${styles.seat} ${seat.isBooked ? styles.sold : isSelected ? styles.selected : styles.available} ${seatType?.name.includes("Đôi") ? styles.couple : ''}`}
                                onClick={() => toggleSeat(seat.name)}
                                disabled={seat.isBooked}
                            >
                                {seat.name}
                            </button>
                        );
                    })}
                </div>
            ))}

            <div className={styles.summary}>
                <div>Ghế đã chọn: {selectedSeats.join(', ') || 'Chưa chọn'}</div>
                <div>Tổng tiền: {totalPrice.toLocaleString()} VND</div>
                <div>Thời gian còn lại: {formatTime(countdown)}</div>
            </div>
        </div>
    );
};

export default SeatList;
