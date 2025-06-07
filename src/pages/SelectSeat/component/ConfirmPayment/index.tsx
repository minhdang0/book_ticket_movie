import React, { useState } from 'react'
import Modal from '../../../../components/Modal'
import { useNavigate } from 'react-router-dom'
import styles from './ConfirmPayment.module.scss'

type Props = {
    isOpen: boolean,
    handleClose: () => void,
    onConfirm?: () => void
}

const ConfirmPayment: React.FC<Props> = ({ isOpen, handleClose, onConfirm }) => {
    const [agreed, setAgreed] = useState(false);
    const navigate = useNavigate();

    const handlePayment = () => {
        if (agreed) {
            if (onConfirm) {
                onConfirm();
            }

            handleClose();
            navigate('/payment')
        }
    }

    const handleCancel = () => {
        setAgreed(false);
        handleClose();
    }

    // Reset agreed state khi modal đóng/mở
    React.useEffect(() => {
        if (!isOpen) {
            setAgreed(false);
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onCLose={handleClose}>
            <div className={styles.confirmPayment}>
                <h2 className={styles.confirmPayment__header}>
                    Điều khoản thanh toán
                </h2>

                <div className={styles.confirmPayment__content}>
                    <div className={styles.confirmPayment__welcome}>
                        Chào mừng Quý khách hàng đến với Hệ thống Bán Vé Online của chuỗi Rạp Chiếu Phim CINEMAGO!
                    </div>

                    <p className={styles.confirmPayment__thankYou}>
                        Xin cảm ơn và chúc Quý khách hàng có những giây phút xem phim tuyệt vời tại CINEMAGO!
                    </p>

                    <p className={styles.confirmPayment__termsTitle}>
                        Điều khoản về độ tuổi:
                    </p>

                    <ul className={styles.confirmPayment__termsList}>
                        <li>Khách hàng phải từ 13 tuổi trở lên để mua vé online.</li>
                        <li>Đối với phim có giới hạn độ tuổi (16+, 18+), khách hàng cần đảm bảo đáp ứng yêu cầu trước khi thanh toán.</li>
                        <li>Rạp có quyền từ chối phục vụ nếu phát hiện thông tin sai lệch về độ tuổi.</li>
                    </ul>

                    <div className={styles.confirmPayment__agreement}>
                        <label>
                            <input
                                type="radio"
                                name="agreement"
                                checked={agreed}
                                onChange={() => setAgreed(true)}
                                className={styles.confirmPayment__radio}
                            />
                            <span className={styles.confirmPayment__agreementText}>
                                Tôi đồng ý với các điều khoản trên
                            </span>
                        </label>
                    </div>

                    <div className={styles.confirmPayment__buttonContainer}>
                        <button
                            onClick={handleCancel}
                            className={`${styles.confirmPayment__button} ${styles['confirmPayment__button--secondary']}`}
                        >
                            Hủy bỏ
                        </button>

                        <button
                            onClick={handlePayment}
                            disabled={!agreed}
                            className={`${styles.confirmPayment__button} ${agreed
                                ? styles['confirmPayment__button--primary']
                                : styles['confirmPayment__button--disabled']
                                }`}
                        >
                            Thanh toán
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default ConfirmPayment