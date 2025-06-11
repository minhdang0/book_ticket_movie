import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Card, CardBody, Container, Row, Col, Button } from 'reactstrap';
import styles from './Payment.module.scss'
import randomContent from '../../utils/format/randomContent';
import { RootState } from '../../store';
import { useSelector } from 'react-redux';
import { IBooking } from '../../utils/interfaces/booking';
import { IBill } from '../../utils/interfaces/bill';
import { ITicket } from '../../utils/interfaces/ticket';
import { IFood } from '../../utils/interfaces/food';
import useCurrentUser from '../../hooks/useCurrentUser';
import Bill from './component/Bill';
import bookingService from '../../services/bookingService';
import billService from '../../services/billService';
import { ISeat } from './../../utils/interfaces/seat';
import PaymentChecker, { PaymentStatus } from './component/PaymentChecked';

interface BookingData {
    selectedSeats: string[],
    selectedSeatIds: string[],
    sessionId: string,
    showtimeId: string,
    timestamp: Date
}

interface SelectedCombo {
    id: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
}

interface Transaction {
    'Mã GD': number;
    'Mô tả': string;
    'Giá trị': number;
    'Ngày diễn ra': string;
    'Số tài khoản': string;
}

const Payment: React.FC = () => {
    const [content, setContent] = useState<string>('');
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.WAITING);
    const [selectedSeat, setSelectedSeat] = useState<ISeat[]>([]);
    const [selectedCombos, setSelectedCombos] = useState<SelectedCombo[]>([]);
    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isChecking, setIsChecking] = useState<boolean>(false);
    const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
    const [billData, setBillData] = useState<IBill | null>(null);

    const { seats } = useSelector((state: RootState) => state.seat);
    const { currentShowtime } = useSelector((state: RootState) => state.showtime);
    const { currentMovie } = useSelector((state: RootState) => state.movie);
    const currentUser = useCurrentUser();

    const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Load booking data từ localStorage
    useEffect(() => {
        if (currentShowtime?._id && seats.length > 0) {
            const storedBookingData: BookingData = JSON.parse(
                localStorage.getItem(`bookingData_${currentShowtime._id}`) || '{}'
            );

            const storedCombos: SelectedCombo[] = JSON.parse(
                localStorage.getItem(`selectedCombos_${currentShowtime._id}`) || '[]'
            );

            if (storedBookingData && storedBookingData.selectedSeatIds) {
                const selected = seats.filter((seat: ISeat) =>
                    storedBookingData.selectedSeatIds.includes(seat._id)
                );
                setSelectedSeat(selected);
                setBookingData(storedBookingData);
                setSelectedCombos(storedCombos);
            }
        }
    }, [currentShowtime, seats]);

    // Generate random content for transfer
    useEffect(() => {
        const randomTransferContent = randomContent();
        setContent(randomTransferContent);
    }, []);

    // Calculate total price
    const getTotalPrice = useCallback((): number => {
        const seatTotal = selectedSeat.reduce((acc: number, cur: ISeat) => acc + cur.seatTypePrice, 0);
        const comboTotal = selectedCombos.reduce((acc: number, cur: SelectedCombo) => acc + (cur.price * cur.quantity), 0);
        return seatTotal + comboTotal;
    }, [selectedSeat, selectedCombos]);

    // Create pending booking
    const createPendingBooking = useCallback(async (): Promise<void> => {
        if (!currentUser || !bookingData || selectedSeat.length === 0 || createdBookingId) {
            return;
        }

        try {
            const pendingBooking: IBooking = {
                customer_id: currentUser._id,
                seat_numbers: bookingData.selectedSeats,
                ticket_quantity: selectedSeat.length,
                total_price: getTotalPrice(),
                booking_status: 'Pending',
                voucher: ''
            };

            const createdBooking = await bookingService.createBooking(pendingBooking);
            setCreatedBookingId(createdBooking._id);
            console.log('Pending booking created:', createdBooking);
        } catch (error) {
            console.error('Failed to create pending booking:', error);
            setErrorMessage('Không thể tạo booking. Vui lòng thử lại.');
        }
    }, [currentUser, bookingData, selectedSeat, getTotalPrice, createdBookingId]);

    // Confirm booking
    const confirmBooking = useCallback(async (): Promise<void> => {
        if (!createdBookingId) {
            throw new Error('No booking ID found');
        }

        try {
            const updatedBooking: IBooking = {
                booking_status: 'Confirmed'
            };

            const result = await bookingService.updateBookingStatus(createdBookingId, updatedBooking);
            console.log('Booking confirmed:', result);
            return result;
        } catch (error) {
            console.error('Failed to confirm booking:', error);
            throw new Error('Không thể xác nhận booking');
        }
    }, [createdBookingId]);

    // Create bill and items - FIXED VERSION
    const createBillAndItems = useCallback(async (): Promise<void> => {
        if (!createdBookingId || !currentShowtime || !currentMovie) {
            throw new Error('Missing required data for bill creation');
        }

        try {
            console.log('Creating bill with data:', {
                createdBookingId,
                selectedSeat,
                selectedCombos,
                totalPrice: getTotalPrice()
            });

            const billData: IBill = {
                booking_id: createdBookingId,
                showtime_id: currentShowtime._id,
                print_time: new Date(),
                total: getTotalPrice(),
                product_list: [
                    ...selectedSeat.map((seat: ISeat) => ({
                        seat_number: seat.name,
                        seat_type: seat.seatTypeName,
                        price: seat.seatTypePrice,
                        type: 'seat'
                    })),
                    ...selectedCombos.map((combo: SelectedCombo) => ({
                        seat_number: combo.name,
                        seat_type: `Combo (x${combo.quantity})`,
                        price: combo.price * combo.quantity,
                        type: 'combo'
                    }))
                ]
            };

            console.log('Bill data to create:', billData);

            // Tạo bill trước
            const createdBill = await billService.createBill(billData);
            console.log('Bill created successfully:', createdBill);

            // Kiểm tra nếu bill được tạo thành công
            if (!createdBill || !createdBill._id) {
                throw new Error('Failed to create bill - no ID returned');
            }

            // Tạo tickets nếu có ghế
            if (selectedSeat.length > 0) {
                console.log('Creating tickets for seats:', selectedSeat);

                const ticketData: Partial<ITicket>[] = selectedSeat.map((seat: ISeat) => ({
                    bill_id: createdBill._id,
                    movie_id: currentMovie,
                    seat_name: seat.name,
                    room_name: currentShowtime.room_name || 'Phòng chiếu',
                    cinema_name: currentShowtime.cinema_name || 'CGV Cinema',
                    show_time: new Date(currentShowtime.start_time),
                    price: seat.seatTypePrice
                }));

                const createdTickets = await billService.createTickets(createdBill._id, ticketData);
                console.log('Tickets created successfully:', createdTickets);
            }

            // Tạo food items nếu có combo
            if (selectedCombos.length > 0) {
                console.log('Creating food items for combos:', selectedCombos);

                const foodData: Partial<IFood>[] = selectedCombos.map((combo: SelectedCombo) => ({
                    bill_id: createdBill._id,
                    name: combo.name,
                    price: combo.price,
                    quantity: combo.quantity
                }));

                const createdFoods = await billService.createFoods(createdBill._id, foodData);
                console.log('Food items created successfully:', createdFoods);
            }

            // Cập nhật state với bill data
            setBillData(createdBill);
            console.log('Bill creation process completed successfully');

        } catch (error: any) {
            console.error('Failed to create bill and items:', error);
            throw new Error(`Không thể tạo hóa đơn: ${error.message || 'Unknown error'}`);
        }
    }, [createdBookingId, currentShowtime, currentMovie, selectedSeat, selectedCombos, getTotalPrice]);

    // Cancel booking
    const cancelBooking = useCallback(async (): Promise<void> => {
        if (!createdBookingId || paymentStatus === PaymentStatus.SUCCESS) {
            return;
        }

        try {
            const cancelledBooking: IBooking = {
                booking_status: 'Cancelled'
            };

            await bookingService.updateBookingStatus(createdBookingId, cancelledBooking);
            console.log('Booking cancelled');
        } catch (error) {
            console.error('Failed to cancel booking:', error);
        }
    }, [createdBookingId, paymentStatus]);

    // Handle transaction found - SIMPLIFIED VERSION
    const handleTransactionFound = useCallback((transaction: Transaction) => {
        console.log('Valid transaction found:', transaction);
        setPaymentStatus(PaymentStatus.PROCESSING);

        // Xử lý thanh toán sau 3 giây
        processingTimeoutRef.current = setTimeout(async () => {
            try {
                console.log('Starting payment processing...');

                // Chỉ confirm booking
                await confirmBooking();
                console.log('Booking confirmed successfully');

                // Set success status - bill sẽ được tạo trong useEffect
                setPaymentStatus(PaymentStatus.SUCCESS);

                // Clear localStorage
                if (currentShowtime?._id) {
                    localStorage.removeItem(`bookingData_${currentShowtime._id}`);
                    localStorage.removeItem(`selectedCombos_${currentShowtime._id}`);
                }

                console.log('Payment processing completed successfully');
            } catch (error: any) {
                console.error('Payment processing failed:', error);
                setPaymentStatus(PaymentStatus.FAILED);
                setErrorMessage(error.message || 'Có lỗi xảy ra khi xử lý thanh toán.');
            }
        }, 3000);
    }, [confirmBooking, currentShowtime]);

    // Tạo bill khi payment status thành SUCCESS
    useEffect(() => {
        const createBillWhenSuccess = async () => {
            if (paymentStatus === PaymentStatus.SUCCESS && createdBookingId && !billData) {
                try {
                    console.log('Payment successful, creating bill...');
                    await createBillAndItems();
                    console.log('Bill created successfully after payment success');
                } catch (error) {
                    console.error('Failed to create bill after payment success:', error);
                    setErrorMessage('Thanh toán thành công nhưng không thể tạo hóa đơn. Vui lòng liên hệ hỗ trợ.');
                }
            }
        };

        createBillWhenSuccess();
    }, [paymentStatus, createdBookingId, billData, createBillAndItems]);

    // Create pending booking when ready
    useEffect(() => {
        if (selectedSeat.length > 0 && bookingData && !createdBookingId) {
            createPendingBooking();
        }
    }, [selectedSeat, bookingData, createPendingBooking, createdBookingId]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (processingTimeoutRef.current) {
                clearTimeout(processingTimeoutRef.current);
            }
            if (createdBookingId && paymentStatus !== PaymentStatus.SUCCESS) {
                cancelBooking();
            }
        };
    }, [createdBookingId, paymentStatus, cancelBooking]);

    // Reset payment
    const handleReset = (): void => {
        setPaymentStatus(PaymentStatus.WAITING);
        setErrorMessage('');
        setBillData(null);
        const newContent = randomContent();
        setContent(newContent);
    };

    const handleDataFromChild = (data: PaymentStatus) => {
        setPaymentStatus(data);
    };

    // Show bill if payment successful
    if (paymentStatus === PaymentStatus.SUCCESS) {
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

                            {/* Payment Checker Component */}
                            <PaymentChecker
                                totalAmount={getTotalPrice()}
                                transferContent={content}
                                paymentStatus={paymentStatus}
                                isChecking={isChecking}
                                onStatusChange={handleDataFromChild}
                                onCheckingChange={setIsChecking}
                                onTransactionFound={handleTransactionFound}
                                onError={setErrorMessage}
                            />

                            {/* Payment Information */}
                            <div className="payment-info mb-4 mt-4">
                                <Row>
                                    <Col sm={6}>
                                        <p><strong>Tổng tiền:</strong></p>
                                        <h5 className="text-primary">
                                            {getTotalPrice().toLocaleString('vi-VN')} VNĐ
                                        </h5>
                                    </Col>
                                    <Col sm={6}>
                                        <p><strong>Số ghế:</strong></p>
                                        <p>{bookingData.selectedSeats.join(', ')}</p>
                                    </Col>
                                </Row>

                                {selectedCombos.length > 0 && (
                                    <Row className="mt-3">
                                        <Col>
                                            <p><strong>Combo đã chọn:</strong></p>
                                            {selectedCombos.map((combo, index) => (
                                                <div key={index} className="mb-1">
                                                    <span className="badge bg-info me-2">{combo.quantity}x</span>
                                                    {combo.name} - {(combo.price * combo.quantity).toLocaleString('vi-VN')} VNĐ
                                                </div>
                                            ))}
                                        </Col>
                                    </Row>
                                )}

                                <div className="mt-3">
                                    <p><strong>Nội dung chuyển khoản:</strong></p>
                                    <code className="bg-light p-2 d-block rounded">
                                        {content}
                                    </code>
                                </div>
                            </div>

                            {/* Error handling */}
                            {paymentStatus === PaymentStatus.FAILED && (
                                <div className="text-center mt-3">
                                    <div className="text-danger small mb-2">{errorMessage}</div>
                                    <Button color="primary" size="sm" onClick={handleReset}>
                                        Thử lại
                                    </Button>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Payment;