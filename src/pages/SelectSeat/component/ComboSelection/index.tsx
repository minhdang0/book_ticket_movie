import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faUser } from '@fortawesome/free-solid-svg-icons';
import styles from './ComboSelection.module.scss';
import Button from '../../../../components/Button';
import { ISeat } from '../../../../utils/interfaces/seat';
import useCurrentUser from '../../../../hooks/useCurrentUser';
import ConfirmPayment from '../ConfirmPayment';
import { ComboItem } from '../../../../utils/interfaces/combo';
import { combos } from '../../../../utils/data/comboData';

interface PaymentInfo {
    name: string;
    phone: string;
    email: string;
}

type Props = {
    onBack: () => void;
    onContinue: (selectedCombos: ComboItem[], paymentInfo: PaymentInfo) => void;
    selectedSeatsInfo: ISeat[];
    ticketPrice: number;
};

const ComboSelection: React.FC<Props> = ({
    onBack,
    onContinue,
    selectedSeatsInfo,
    ticketPrice
}) => {
    const [selectedCombos, setSelectedCombos] = useState<ComboItem[]>([]);
    const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
        name: '',
        phone: '',
        email: ''
    });
    const user = useCurrentUser();
    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

    const updateComboQuantity = (comboId: string, newQuantity: number) => {
        if (newQuantity === 0) {
            setSelectedCombos(prev => prev.filter(item => item.id !== comboId));
        } else {
            const combo = combos.find(c => c.id === comboId);
            if (combo) {
                setSelectedCombos(prev => {
                    const existingIndex = prev.findIndex(item => item.id === comboId);
                    if (existingIndex >= 0) {
                        const updated = [...prev];
                        updated[existingIndex].quantity = newQuantity;
                        return updated;
                    } else {
                        return [...prev, { ...combo, quantity: newQuantity }];
                    }
                });
            }
        }
    };

    const getComboQuantity = (comboId: string): number => {
        return selectedCombos.find(item => item.id === comboId)?.quantity || 0;
    };

    const handlePaymentInfoChange = (field: keyof PaymentInfo, value: string) => {
        setPaymentInfo(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePaymentClick = () => {
        setShowConfirmModal(true);
    };

    const handleCloseConfirmModal = () => {
        setShowConfirmModal(false);
    };

    const handleConfirmPayment = async () => {
        try {
            setIsProcessingPayment(true);

            onContinue(selectedCombos, paymentInfo);
            setShowConfirmModal(false);

        } catch (error: any) {
            console.error('Error during payment process:', error?.response?.data || error.message);
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const handleCancelBooking = () => {
        onBack();
    };

    const totalComboPrice = selectedCombos.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalPrice = ticketPrice + totalComboPrice;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN').format(price) + ' vnđ';
    };

    const groupSeatsByType = () => {
        const grouped = selectedSeatsInfo.reduce((acc, seat) => {
            const key = `${seat.seatTypeName}-${seat.seatTypePrice}`;
            if (!acc[key]) {
                acc[key] = {
                    seatTypeName: seat.seatTypeName,
                    seatTypePrice: seat.seatTypePrice,
                    seats: [],
                    count: 0
                };
            }
            acc[key].seats.push(seat.name);
            acc[key].count++;
            return acc;
        }, {} as Record<string, {
            seatTypeName: string;
            seatTypePrice: number;
            seats: string[];
            count: number
        }>);

        return Object.values(grouped);
    };

    const seatGroups = groupSeatsByType();

    return (
        <div className={styles.container}>
            {/* Payment Info Section */}
            <div className={styles.paymentInfoSection}>
                <div className={styles.sectionHeader}>
                    <FontAwesomeIcon icon={faUser} />
                    <h3>THÔNG TIN THANH TOÁN</h3>
                </div>

                <div className={styles.paymentForm}>
                    <div className={styles.formRow}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="customerName">Họ Tên:</label>
                            <input
                                type="text"
                                id="customerName"
                                value={user.firstName + user.lastName}
                                name='fullname'
                                onChange={(e) => handlePaymentInfoChange('name', e.target.value)}
                                placeholder=""
                                className={styles.paymentInput}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="customerPhone">Số điện thoại:</label>
                            <input
                                type="tel"
                                id="customerPhone"
                                name='phone'
                                value={user.phone}
                                onChange={(e) => handlePaymentInfoChange('phone', e.target.value)}
                                placeholder="Nhập số điện thoại"
                                className={styles.paymentInput}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="customerEmail">Email:</label>
                            <input
                                type="email"
                                id="customerEmail"
                                name='email'
                                value={user.email}
                                onChange={(e) => handlePaymentInfoChange('email', e.target.value)}
                                placeholder=""
                                className={styles.paymentInput}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Seat Types Section */}
            {seatGroups.map((group, index) => (
                <div key={index} className={styles.specialComboSection}>
                    <div className={styles.sectionHeader}>
                        <h3>{group.seatTypeName.toUpperCase()}</h3>
                        <div className={styles.priceInfo}>
                            <span>{group.count} x {formatPrice(group.seatTypePrice)}</span>
                            <span className={styles.totalPrice}>
                                = {formatPrice(group.count * group.seatTypePrice)}
                            </span>
                        </div>
                    </div>
                    <div className={styles.seatDetails}>
                        <span>Ghế: {group.seats.join(', ')}</span>
                    </div>
                </div>
            ))}

            {/* Combo Special Section */}
            <div className={styles.specialComboSection}>
                <div className={styles.sectionHeader}>
                    <div className={styles.comboIcon}>🍿</div>
                    <h3>COMBO ưu ĐÃI</h3>
                </div>
            </div>

            {/* Combo selection */}
            <div className={styles.comboSection}>
                <h3>COMBO ĐỒ ĂN</h3>
                <div className={styles.comboList}>
                    {combos.map(combo => (
                        <div key={combo.id} className={styles.comboItem}>
                            <div className={styles.comboImage}>
                                <img src={combo.image} alt={combo.name} />
                            </div>
                            <div className={styles.comboInfo}>
                                <h4>{combo.name}</h4>
                                <p className={styles.description}>{combo.description}</p>
                                <p className={styles.price}>{formatPrice(combo.price)}</p>
                            </div>
                            <div className={styles.quantityControl}>
                                <button
                                    onClick={() => updateComboQuantity(combo.id, Math.max(0, getComboQuantity(combo.id) - 1))}
                                    className={styles.quantityBtn}
                                    disabled={getComboQuantity(combo.id) === 0}
                                >
                                    <FontAwesomeIcon icon={faMinus} />
                                </button>
                                <span className={styles.quantity}>{getComboQuantity(combo.id)}</span>
                                <button
                                    onClick={() => updateComboQuantity(combo.id, getComboQuantity(combo.id) + 1)}
                                    className={styles.quantityBtn}
                                >
                                    <FontAwesomeIcon icon={faPlus} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Note và voucher section */}
            <div className={styles.noteSection}>
                <div className={styles.inputGroup}>
                    <label htmlFor="voucher">Ghi chú Voucher</label>
                    <input
                        type="text"
                        id="voucher"
                        placeholder="Nhập mã giảm giá hoặc ghi chú đặc biệt"
                        className={styles.voucherInput}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="orderNote">Ghi chú Đơn</label>
                    <textarea
                        id="orderNote"
                        placeholder="Nhập ghi chú đặc biệt cho đơn hàng của bạn"
                        className={styles.orderNote}
                        rows={3}
                    />
                </div>
            </div>

            {/* Summary */}
            <div className={styles.summary}>
                <div className={styles.summaryRow}>
                    <span>Tổng tiền vé:</span>
                    <span>{formatPrice(ticketPrice)}</span>
                </div>
                <div className={styles.summaryRow}>
                    <span>Tổng tiền combo:</span>
                    <span>{formatPrice(totalComboPrice)}</span>
                </div>
                <div className={styles.summaryRow + ' ' + styles.total}>
                    <span>Tổng cộng:</span>
                    <span>{formatPrice(totalPrice)}</span>
                </div>
            </div>

            {/* Action buttons */}
            <div className={styles.actions}>
                <Button
                    onClick={handleCancelBooking}
                    className={styles.backBtn}
                    disabled={isProcessingPayment}
                >
                    QUAY LẠI
                </Button>
                <Button
                    onClick={handlePaymentClick}
                    className={styles.continueBtn}
                    disabled={isProcessingPayment}
                >
                    {isProcessingPayment ? 'ĐANG XỬ LÝ...' : 'THANH TOÁN'}
                </Button>
            </div>

            {/* Modal xác nhận thanh toán */}
            <ConfirmPayment
                isOpen={showConfirmModal}
                handleClose={handleCloseConfirmModal}
                onConfirm={handleConfirmPayment}
            />
        </div>
    );
};

export default ComboSelection;