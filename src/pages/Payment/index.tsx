import React, { useEffect, useState, useCallback, useRef } from 'react'
import { checkPaid } from '../../services/checkPay';
import { Card, CardBody, Container, Row, Col, Button, Spinner } from 'reactstrap';
import styles from './Payment.module.scss'
import randomContent from '../../utils/format/randomContent';
import { RootState } from '../../store';
import { useSelector } from 'react-redux';
import { IBooking } from '../../utils/interfaces/booking';
import { IBill } from '../../utils/interfaces/bill'; // Cần tạo interface này
import useCurrentUser from '../../hooks/useCurrentUser';
import Bill from './component/Bill';
import bookingService from '../../services/bookingService';
import billService from '../../services/billService';
import { ISeat } from './../../utils/interfaces/seat';

interface BookingData {
    selectedSeats: string[],
    selectedSeatIds: string[],
    sessionId: string,
    showtimeId: string,
    timestamp: Date
}

interface Transaction {
    'Mã GD': number;
    'Mô tả': string;
    'Giá trị': number;
    'Ngày diễn ra': string;
    'Số tài khoản': string;
}

enum PaymentStatus {
    WAITING = 'waiting',
    PROCESSING = 'processing',
    SUCCESS = 'success',
    FAILED = 'failed'
}

const Payment: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [content, setContent] = useState<string>('');
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.WAITING);
    const [selectedSeat, setSelectedSeat] = useState<ISeat[]>([]);
    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isChecking, setIsChecking] = useState<boolean>(false);
    const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
    const [billData, setBillData] = useState<IBill | null>(null);
    const { seats } = useSelector((state: RootState) => state.seat);
    const { currentShowtime } = useSelector((state: RootState) => state.showtime);
    const currentUser = useCurrentUser();

    const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Load booking data and selected seats
    useEffect(() => {
        if (currentShowtime?._id && seats.length > 0) {
            const storedBookingData: BookingData = JSON.parse(
                localStorage.getItem(`bookingData_${currentShowtime._id}`) || '{}'
            );

            if (storedBookingData && storedBookingData.selectedSeatIds) {
                const selected = seats.filter((seat: ISeat) =>
                    storedBookingData.selectedSeatIds.includes(seat._id)
                );
                setSelectedSeat(selected);
                setBookingData(storedBookingData);
            }
        }
    }, [currentShowtime, seats]);

    // Generate random content for transfer
    useEffect(() => {
        const randomTransferContent = randomContent();
        setContent(randomTransferContent);
    }, []);

    // Calculate total price
    const getTotalPrice = useCallback((seats: ISeat[]): number => {
        return seats.reduce((acc: number, cur: ISeat) => acc + cur.seatTypePrice, 0);
    }, []);

    // Check if transaction matches our payment
    const isValidTransaction = useCallback((transaction: Transaction): boolean => {
        const totalPrice = getTotalPrice(selectedSeat);
        const isAmountMatch = transaction['Giá trị'] === totalPrice;
        const isContentMatch = transaction['Mô tả'].includes(content);

        return isAmountMatch && isContentMatch;
    }, [selectedSeat, content, getTotalPrice]);

    // Create pending booking when component mounts
    const createPendingBooking = useCallback(async (): Promise<void> => {
        if (!currentUser || !bookingData || selectedSeat.length === 0 || createdBookingId) {
            return;
        }

        try {
            const pendingBooking: IBooking = {
                customer_id: currentUser._id,
                seat_numbers: bookingData.selectedSeats,
                ticket_quantity: selectedSeat.length,
                total_price: getTotalPrice(selectedSeat),
                booking_status: 'Pending',
                voucher: ''
            };

            const createdBooking = await bookingService.createBooking(pendingBooking);
            setCreatedBookingId(createdBooking._id);
            console.log('Pending booking created:', createdBooking);
        } catch (error) {
            console.error('Failed to create pending booking:', error);
        }
    }, [currentUser, bookingData, selectedSeat, getTotalPrice, createdBookingId]);

    // Update booking status to Confirmed
    const confirmBooking = useCallback(async (): Promise<void> => {
        if (!createdBookingId) {
            throw new Error('No booking ID found');
        }

        const updatedBooking: IBooking = {
            _id: createdBookingId,
            booking_status: 'Confirmed'
        };

        const result = await bookingService.updateBookingStatus(updatedBooking);
        console.log('Booking confirmed:', result);
        return result;
    }, [createdBookingId]);

    // Create bill after successful payment
    const createBillRecord = useCallback(async (): Promise<void> => {
        if (!createdBookingId) {
            throw new Error('No booking ID found');
        }

        const billData: IBill = {
            booking_id: createdBookingId,
            ticket_id: bookingData?.sessionId || '', // hoặc lấy từ showtime
            time: new Date(),
            total_price: getTotalPrice(selectedSeat),
            product_list: selectedSeat.map((seat: ISeat) => ({
                seat_number: seat.name,
                seat_type: seat.seatTypeName,
                price: seat.seatTypePrice
            }))
        };

        const createdBill = await billService.createBill(billData);
        setBillData(createdBill);
        console.log('Bill created:', createdBill);
    }, [createdBookingId, bookingData, selectedSeat, getTotalPrice]);

    // Cancel booking when component unmounts
    const cancelBooking = useCallback(async (): Promise<void> => {
        if (!createdBookingId || paymentStatus === PaymentStatus.SUCCESS) {
            return;
        }

        try {
            const cancelledBooking: IBooking = {
                _id: createdBookingId,
                booking_status: 'Cancelled'
            };

            await bookingService.updateBookingStatus(cancelledBooking);
            console.log('Booking cancelled:', createdBookingId);
        } catch (error) {
            console.error('Failed to cancel booking:', error);
        }
    }, [createdBookingId, paymentStatus]);

    // Check payment status (chạy ngầm)
    const checkPaymentStatus = useCallback(async (): Promise<void> => {
        if (paymentStatus !== PaymentStatus.WAITING) return;

        try {
            setIsChecking(true);
            const response = await checkPaid();
            setTransactions(response);

            const validTransaction = response.find((transaction: Transaction) =>
                isValidTransaction(transaction)
            );

            if (validTransaction) {
                setPaymentStatus(PaymentStatus.PROCESSING);

                // Xử lý trong 3 giây
                processingTimeoutRef.current = setTimeout(async () => {
                    try {
                        await confirmBooking();
                        await createBillRecord();
                        setPaymentStatus(PaymentStatus.SUCCESS);

                        // Clear booking data from localStorage
                        if (currentShowtime?._id) {
                            localStorage.removeItem(`bookingData_${currentShowtime._id}`);
                        }
                    } catch (error) {
                        console.error('Payment processing failed:', error);
                        setPaymentStatus(PaymentStatus.FAILED);
                        setErrorMessage('Có lỗi xảy ra khi xử lý thanh toán.');
                    }
                }, 3000);
            }
        } catch (error) {
            console.error('Payment check failed:', error);
            setErrorMessage('Có lỗi xảy ra khi kiểm tra thanh toán.');
        } finally {
            setIsChecking(false);
        }
    }, [paymentStatus, isValidTransaction, confirmBooking, createBillRecord, currentShowtime]);

    // Auto check payment every 10 seconds
    useEffect(() => {
        if (paymentStatus === PaymentStatus.WAITING && selectedSeat.length > 0 && content) {
            checkPaymentStatus();
            checkIntervalRef.current = setInterval(checkPaymentStatus, 10000);
        }

        return () => {
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
            }
            if (processingTimeoutRef.current) {
                clearTimeout(processingTimeoutRef.current);
            }
        };
    }, [paymentStatus, selectedSeat.length, content, checkPaymentStatus]);

    // Create pending booking when component mounts
    useEffect(() => {
        if (selectedSeat.length > 0 && bookingData && !createdBookingId) {
            createPendingBooking();
        }
    }, [selectedSeat, bookingData, createPendingBooking, createdBookingId]);

    // Handle component unmount - cancel booking if not successful
    useEffect(() => {
        return () => {
            if (createdBookingId && paymentStatus !== PaymentStatus.SUCCESS) {
                cancelBooking();
            }
        };
    }, [createdBookingId, paymentStatus, cancelBooking]);

    // Reset payment process
    const handleReset = (): void => {
        setPaymentStatus(PaymentStatus.WAITING);
        setErrorMessage('');
        setTransactions([]);
        setBillData(null);

        const newContent = randomContent();
        setContent(newContent);
    };

    // Render payment status under QR code
    const renderPaymentStatusIndicator = () => {
        switch (paymentStatus) {
            case PaymentStatus.WAITING:
                return (
                    <div className="text-center mt-3">
                        <div className="d-flex align-items-center justify-content-center">
                            {isChecking && (
                                <Spinner size="sm" color="primary" className="me-2" />
                            )}
                            <span className="text-muted">
                                {isChecking ? 'Đang kiểm tra giao dịch...' : 'Chờ thanh toán'}
                            </span>
                        </div>
                    </div>
                );

            case PaymentStatus.PROCESSING:
                return (
                    <div className="text-center mt-3">
                        <div className="d-flex align-items-center justify-content-center">
                            <Spinner size="sm" color="warning" className="me-2" />
                            <span className="text-warning fw-bold">Đang xử lý thanh toán...</span>
                        </div>
                    </div>
                );

            case PaymentStatus.SUCCESS:
                return (
                    <div className="text-center mt-3">
                        <div className="text-success fw-bold">
                            ✅ Thanh toán thành công!
                        </div>
                    </div>
                );

            case PaymentStatus.FAILED:
                return (
                    <div className="text-center mt-3">
                        <div className="text-danger fw-bold mb-2">
                            ❌ Thanh toán thất bại
                        </div>
                        <div className="text-danger small mb-2">{errorMessage}</div>
                        <Button color="primary" size="sm" onClick={handleReset}>
                            Thử lại
                        </Button>
                    </div>
                );

            default:
                return null;
        }
    };

    // Hiển thị hóa đơn khi thanh toán thành công
    if (paymentStatus === PaymentStatus.SUCCESS && billData) {
        return <Bill bill={billData} booking={createdBookingId} />;
    }

    if (!selectedSeat.length || !bookingData) {
        return (
            <Container className={styles.container}>
                <div className="text-danger text-center">
                    Không tìm thấy thông tin đặt vé. Vui lòng quay lại trang chọn ghế.
                </div>
            </Container>
        );
    }

    return (
        <Container className={styles.container}>
            <Row>
                <Col md={8} className="mx-auto">
                    <Card>
                        <CardBody>
                            <h4 className="text-center mb-4">Thanh toán qua chuyển khoản</h4>

                            {/* QR Code */}
                            <div className={`${styles.qrWrapper} text-center mb-3`}>
                                <img
                                    src="https://img.vietqr.io/image/MB-065232626-compact.png"
                                    alt="QR Code"
                                    className={styles.qr}
                                />
                            </div>

                            {/* Payment Status Indicator */}
                            {renderPaymentStatusIndicator()}

                            {/* Payment Information */}
                            <div className="payment-info mb-4 mt-4">
                                <Row>
                                    <Col sm={6}>
                                        <p><strong>Tổng tiền:</strong></p>
                                        <h5 className="text-primary">
                                            {getTotalPrice(selectedSeat).toLocaleString('vi-VN')} VNĐ
                                        </h5>
                                    </Col>
                                    <Col sm={6}>
                                        <p><strong>Số ghế:</strong></p>
                                        <p>{bookingData.selectedSeats.join(', ')}</p>
                                    </Col>
                                </Row>

                                <div className="mt-3">
                                    <p><strong>Nội dung chuyển khoản:</strong></p>
                                    <code className="bg-light p-2 d-block rounded">
                                        {content}
                                    </code>
                                </div>
                            </div>

                            {/* Manual Check Button (chỉ hiện khi cần) */}
                            {paymentStatus === PaymentStatus.WAITING && !isChecking && (
                                <div className="text-center mt-3">
                                    <Button
                                        color="outline-primary"
                                        size="sm"
                                        onClick={checkPaymentStatus}
                                    >
                                        Kiểm tra ngay
                                    </Button>
                                </div>
                            )}

                            {/* Transaction History (ẩn bớt, chỉ hiện khi có lỗi hoặc cần debug) */}
                            {transactions.length > 0 && paymentStatus === PaymentStatus.FAILED && (
                                <details className="mt-4">
                                    <summary className="text-muted small">Xem giao dịch gần nhất</summary>
                                    <div className="mt-2">
                                        {transactions.map((transaction, index) => (
                                            <div key={index} className="border rounded p-2 mb-2 small">
                                                <div><strong>Mã GD:</strong> {transaction['Mã GD']}</div>
                                                <div><strong>Số tiền:</strong> {transaction['Giá trị'].toLocaleString('vi-VN')} VNĐ</div>
                                                <div><strong>Thời gian:</strong> {transaction['Ngày diễn ra']}</div>
                                                <div><strong>Mô tả:</strong> {transaction['Mô tả']}</div>
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            )}
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Payment;