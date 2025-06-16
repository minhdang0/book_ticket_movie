import React from 'react';
import styles from './SeatLegend.module.scss';

const SeatLegend: React.FC = () => {
    return (
        <div className={styles.legend}>
            <span className={`${styles.seat} ${styles.available}`} /> Ghế trống
            <span className={`${styles.seat} ${styles.vip}`} /> Ghế VIP
            <span className={`${styles.seat} ${styles.couple}`} /> Ghế đôi
            <span className={`${styles.seat} ${styles.selected}`} /> Ghế đang chọn
            <span className={`${styles.seat} ${styles.selecting}`} /> Đang được chọn
            <span className={`${styles.seat} ${styles.sold}`} /> Ghế đã bán
        </div>
    );
};

export default SeatLegend;