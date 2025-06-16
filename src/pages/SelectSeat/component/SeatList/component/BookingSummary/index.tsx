import React from 'react';
import styles from './BookingSummary.module.scss';
import { ISeat } from '../../../../../../utils/interfaces/seat';

interface BookingSummaryProps {
    selectedSeats: string[];
    seats: ISeat[];
    countdown: number;
    isLoading: boolean;
    onExtendSession: () => void;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
    selectedSeats,
    seats,
    countdown,
    isLoading,
    onExtendSession
}) => {
    const totalPrice = selectedSeats.reduce((sum, name) => {
        const seat = seats.find(s => s.name === name);
        return seat ? sum + seat.seatTypePrice : sum;
    }, 0);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className={styles.summary}>
            <div>Ghế đã chọn: {selectedSeats.join(', ') || 'Chưa chọn'}</div>
            <div>Tổng tiền: {totalPrice.toLocaleString()} VND</div>
            <div className={styles.timeSection}>
                <span>Thời gian còn lại: {formatTime(countdown)}</span>
                {countdown < 120 && countdown > 0 && (
                    <button
                        className={styles.extendButton}
                        onClick={onExtendSession}
                        disabled={isLoading}
                    >
                        Gia hạn
                    </button>
                )}
            </div>
            {isLoading && <div className={styles.loadingText}>Đang xử lý...</div>}
        </div>
    );
};

export default BookingSummary;