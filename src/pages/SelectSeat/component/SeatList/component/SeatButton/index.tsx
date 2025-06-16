import React from 'react';
import styles from './SeatButton.module.scss';
import { ISeat } from '../../../../../../utils/interfaces/seat';

interface SeatButtonProps {
    seat: ISeat;
    isSelected: boolean;
    isOccupiedByOther: boolean;
    isCoupleSeat: boolean;
    isLoading: boolean;
    onToggle: (seatName: string) => void;
}

const SeatButton: React.FC<SeatButtonProps> = ({
    seat,
    isSelected,
    isOccupiedByOther,
    isCoupleSeat,
    isLoading,
    onToggle
}) => {
    const getSeatStatus = () => {
        if (seat.isBooked) {
            return { className: styles.sold, disabled: true, tooltip: 'Ghế đã bán' };
        }

        if (isSelected) {
            return { className: styles.selected, disabled: false, tooltip: 'Ghế bạn đang chọn' };
        }

        if (isOccupiedByOther) {
            return {
                className: styles.selecting,
                disabled: true,
                tooltip: 'Đang được chọn bởi người khác'
            };
        }

        // Kiểm tra ghế VIP dựa trên tên loại ghế hoặc giá
        const isVipSeat = seat.seatTypeName?.toLowerCase().includes('vip') || seat.seatTypePrice > 100000;

        return {
            className: isVipSeat ? styles.vip : styles.available,
            disabled: false,
            tooltip: 'Ghế trống'
        };
    };

    const seatStatus = getSeatStatus();

    return (
        <button
            className={`${styles.seat} ${seatStatus.className} ${isCoupleSeat ? styles.couple : ''} ${isLoading ? styles.loading : ''}`}
            onClick={() => onToggle(seat.name)}
            disabled={seatStatus.disabled || isLoading}
            title={`${seat.name} - ${seat.seatTypeName} - ${seat.seatTypePrice.toLocaleString()} VND - ${seatStatus.tooltip}`}
        >
            {seat.name}
        </button>
    );
};

export default SeatButton;