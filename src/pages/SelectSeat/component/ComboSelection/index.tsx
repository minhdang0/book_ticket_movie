import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faUser } from '@fortawesome/free-solid-svg-icons';
import styles from './ComboSelection.module.scss';
import Button from '../../../../components/Button';
import { ISeat } from '../../../../utils/interfaces/seat';
import useCurrentUser from '../../../../hooks/useCurrentUser';
import ConfirmPayment from '../ConfirmPayment';
import { ComboItem } from '../../../../utils/interfaces/combo';
import { combos } from '../../../../utils/data/comboData';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import billService from '../../../../services/billService';
import bookingService from '../../../../services/bookingService';
import { IBill } from '../../../../utils/interfaces/bill';
import { IBooking } from '../../../../utils/interfaces/booking';
import { IFood } from '../../../../utils/interfaces/food';
import { ITicket } from '../../../../utils/interfaces/ticket';

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
    const [voucher, setVoucher] = useState<string>('');
    const [orderNote, setOrderNote] = useState<string>('');

    const user = useCurrentUser();
    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

    const { currentShowtime } = useSelector((state: RootState) => state.showtime);

    // Load combo data từ localStorage khi component mount
    useEffect(() => {
        if (currentShowtime?._id) {
            const savedCombos = JSON.parse(
                localStorage.getItem(`selectedCombos_${currentShowtime._id}`) || '[]'
            );
            setSelectedCombos(savedCombos);
        }
    }, [currentShowtime]);

    // Cập nhật localStorage mỗi khi selectedCombos thay đổi
    useEffect(() => {
        if (currentShowtime?._id) {
            localStorage.setItem(`selectedCombos_${currentShowtime._id}`, JSON.stringify(selectedCombos));
        }
    }, [selectedCombos, currentShowtime]);

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

    // Tạo booking với thông tin combo - FIX: Thêm showtime_id vào IBooking
    const createBookingWithCombo = async (): Promise<string> => {
        const bookingData: IBooking = {
            customer_id: user._id,
            seat_numbers: selectedSeatsInfo.map(seat => seat.name),
            ticket_quantity: selectedSeatsInfo.length,
            total_price: ticketPrice + totalComboPrice,
            booking_status: 'Confirmed',
            voucher: voucher,

        };

        const createdBooking = await bookingService.createBooking(bookingData);
        return createdBooking._id;
    };

    // Tạo bill với thông tin đầy đủ - Sử dụng đúng interface IBill (không có showtime_id)
    const createFullBill = async (bookingId: string): Promise<IBill> => {
        // Tạo product list bao gồm cả ghế và combo
        const seatProducts = selectedSeatsInfo.map(seat => ({
            seat_number: seat.name,
            seat_type: seat.seatTypeName,
            price: seat.seatTypePrice
        }));

        const comboProducts = selectedCombos.map(combo => ({
            seat_number: `Combo: ${combo.name}`, // Sử dụng trường này để lưu tên combo
            seat_type: 'Food & Beverage',
            price: combo.price * combo.quantity
        }));

        const billData: IBill = {
            booking_id: bookingId,
            ticket_id: currentShowtime?._id || '', // ticket_id có thể là movie_id hoặc showtime_id
            print_time: new Date(),
            total: ticketPrice + totalComboPrice,
            product_list: [...seatProducts, ...comboProducts]
        };

        const createdBill = await billService.createBill(billData);
        return createdBill;
    };

    // Tạo tickets cho từng ghế
    const createTicketsForSeats = async (billId: string): Promise<void> => {
        const ticketData: Omit<ITicket, '_id'>[] = selectedSeatsInfo.map(seat => ({
            bill_id: billId,
            movie_id: currentShowtime?.movie_id,
            seat_name: seat.name,
            room_name: currentShowtime?.room_name,
            cinema_name: currentShowtime?.cinema_name,
            show_time: currentShowtime?.show_time,
            price: seat.seatTypePrice
        }));

        await billService.createTickets(billId, ticketData);
    };

    // Tạo food items cho combo
    const createFoodItems = async (billId: string): Promise<void> => {
        if (selectedCombos.length === 0) return;

        const foodData: Omit<IFood, '_id'>[] = selectedCombos.map(combo => ({
            bill_id: billId,
            name: combo.name,
            price: combo.price,
            quantity: combo.quantity
        }));

        await billService.createFoods(billId, foodData);
    };

    const handlePaymentClick = () => {
        // Lưu thông tin bổ sung vào localStorage
        if (currentShowtime?._id) {
            const bookingExtras = {
                voucher,
                orderNote,
                selectedCombos,
                paymentInfo: {
                    name: user.firstName + " " + user.lastName,
                    phone: user.phone,
                    email: user.email
                }
            };
            localStorage.setItem(`bookingExtras_${currentShowtime._id}`, JSON.stringify(bookingExtras));
        }

        setShowConfirmModal(true);
    };

    const handleCloseConfirmModal = () => {
        setShowConfirmModal(false);
    };

    const handleConfirmPayment = async () => {
        try {
            setIsProcessingPayment(true);

            // 1. Tạo booking
            const bookingId = await createBookingWithCombo();

            // 2. Tạo bill
            const createdBill = await createFullBill(bookingId);

            // 3. Tạo tickets cho ghế
            await createTicketsForSeats(createdBill._id!);

            // 4. Tạo food items cho combo
            await createFoodItems(createdBill._id!);

            // 5. Lưu bill ID để chuyển sang trang thanh toán
            if (currentShowtime?._id) {
                localStorage.setItem(`billId_${currentShowtime._id}`, createdBill._id!);
            }

            const finalPaymentInfo: PaymentInfo = {
                name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
                phone: user.phone ?? '',
                email: user.email ?? ''
            };

            // Chuyển sang trang thanh toán
            onContinue(selectedCombos, finalPaymentInfo);
            setShowConfirmModal(false);

        } catch (error: any) {
            console.error('Error during payment process:', error?.response?.data || error.message);
            // alert('Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.');
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
                                value={user.firstName + " " + user.lastName}
                                name='fullname'
                                readOnly
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
                                readOnly
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
                                readOnly
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

            {/* Selected Combos Summary */}
            {selectedCombos.length > 0 && (
                <div className={styles.selectedCombosSection}>
                    <h4>Combo đã chọn:</h4>
                    {selectedCombos.map(combo => (
                        <div key={combo.id} className={styles.selectedComboItem}>
                            <span><strong>{combo.name}</strong> x {combo.quantity}</span>
                            <span>{formatPrice(combo.price * combo.quantity)}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Note và voucher section */}
            <div className={styles.noteSection}>
                <div className={styles.inputGroup}>
                    <label htmlFor="voucher">Ghi chú Voucher</label>
                    <input
                        type="text"
                        id="voucher"
                        value={voucher}
                        onChange={(e) => setVoucher(e.target.value)}
                        placeholder="Nhập mã giảm giá hoặc ghi chú đặc biệt"
                        className={styles.voucherInput}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="orderNote">Ghi chú Đơn</label>
                    <textarea
                        id="orderNote"
                        value={orderNote}
                        onChange={(e) => setOrderNote(e.target.value)}
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
                {selectedCombos.length > 0 && (
                    <div className={styles.summaryRow}>
                        <span>Tổng tiền combo:</span>
                        <span>{formatPrice(totalComboPrice)}</span>
                    </div>
                )}
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