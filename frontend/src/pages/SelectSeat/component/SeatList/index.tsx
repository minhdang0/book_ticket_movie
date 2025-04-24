import React, { useState, useEffect } from 'react';
import styles from './SeatList.module.scss';

type SeatStatus = 'available' | 'selected' | 'sold' | 'reserved';

interface Seat {
    id: string;
    status: SeatStatus;
    isCouple?: boolean;
}

const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const seatsPerRow = 18;

type Props = {
    selectedSeats: string[];
    setSelectedSeats: React.Dispatch<React.SetStateAction<string[]>>;
};

const SeatList: React.FC<Props> = ({ selectedSeats, setSelectedSeats }) => {
    const generateSeats = (): Seat[] => {
        const seats: Seat[] = [];

        rows.forEach((row) => {
            const isCoupleRow = row === 'J';
            const totalSeats = isCoupleRow ? 10 : seatsPerRow;

            for (let i = 1; i <= totalSeats; i++) {
                seats.push({
                    id: `${row}${i}`,
                    status: 'available',
                    isCouple: isCoupleRow,
                });
            }
        });

        return seats;
    };

    const [seats, setSeats] = useState<Seat[]>(generateSeats);
    const [countdown, setCountdown] = useState<number>(600);

    const toggleSeat = (id: string) => {
        const seatIndex = seats.findIndex(seat => seat.id === id);
        const selectedSeat = seats[seatIndex];

        if (!selectedSeat || selectedSeat.status === 'sold' || selectedSeat.status === 'reserved') return;

        let updatedSeats = [...seats];
        let updatedSelectedSeats = [...selectedSeats];

        if (selectedSeat.status === 'available') {
            updatedSeats[seatIndex].status = 'selected';
            updatedSelectedSeats.push(selectedSeat.id);
        } else if (selectedSeat.status === 'selected') {
            updatedSeats[seatIndex].status = 'available';
            updatedSelectedSeats = updatedSelectedSeats.filter(id => id !== selectedSeat.id);
        }

        setSeats(updatedSeats);
        setSelectedSeats(updatedSelectedSeats);
    };

    const totalPrice = selectedSeats.reduce((sum, seatId) => {
        const seat = seats.find(s => s.id === seatId);
        if (!seat) return sum;
        return sum + (seat.isCouple ? 160000 : 75000);
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
        seats: seats.filter(seat => seat.id.startsWith(row)),
    }));

    return (
        <div className={styles.cinema}>
            <div className={styles.legend}>
                <span className={`${styles.seat} ${styles.available}`} /> Ghế trống
                <span className={`${styles.seat} ${styles.couple}`} /> Ghế đôi
                <span className={`${styles.seat} ${styles.selected}`} /> Ghế đang chọn
                <span className={`${styles.seat} ${styles.reserved}`} /> Ghế đang giữ
                <span className={`${styles.seat} ${styles.sold}`} /> Ghế đã bán
            </div>

            <div className={styles.screen}>MÀN HÌNH CHIẾU</div>

            {groupedSeats.map(group => (
                <div
                    key={group.row}
                    className={`${styles.seats} ${group.row === 'J' ? styles.coupleSeats : styles.normalSeats}`}
                >
                    {group.seats.map(seat => (
                        <button
                            key={seat.id}
                            className={`${styles.seat} ${styles[seat.status]} ${seat.isCouple ? styles.couple : ''}`}
                            onClick={() => toggleSeat(seat.id)}
                            disabled={seat.status === 'sold' || seat.status === 'reserved'}
                        >
                            {seat.id}
                        </button>
                    ))}
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
