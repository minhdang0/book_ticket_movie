import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Container, Row, Col } from 'reactstrap';
import SeatList from './component/SeatList';
import InfoMovie from './component/InfoMovie';
import ComboSelection from './component/ComboSelection';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getMovieById } from '../../features/movie/movieAsync';
import { getSeatByRoomById } from '../../features/seat/seatAsync';
import useCinema from '../../hooks/useCinema';
import { ICinema } from '../../utils/interfaces/cinema';
import { ISeat } from '../../utils/interfaces/seat';
import styles from './SelectSeat.module.scss'

type BookingStep = 'seat-selection' | 'combo-selection' | 'payment';

interface ComboItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    quantity: number;
}

interface PaymentInfo {
    name: string;
    phone: string;
    email: string;
}

const SelectSeat: React.FC = () => {
    const { movieId } = useParams<{ movieId: string }>();
    console.log(movieId)
    const location = useLocation();
    const dispatch = useDispatch<AppDispatch>();

    const { movie } = useSelector((state: RootState) => state.movie);
    const { seats } = useSelector((state: RootState) => state.seat);
    const { selectedRoom } = useSelector((state: RootState) => state.room);
    const { currentShowtime } = useSelector((state: RootState) => state.showtime);


    const showtimeId = currentShowtime._id || '';
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [currentStep, setCurrentStep] = useState<BookingStep>('seat-selection');
    const [selectedCombos, setSelectedCombos] = useState<ComboItem[]>([]);

    const bookingInfoStr = localStorage.getItem('bookingInfo');
    const parsedBookingInfo = bookingInfoStr ? JSON.parse(bookingInfoStr) : null;
    const selectedTime = location.state?.selectedTime || parsedBookingInfo?.time;
    const { cinemas, selectedCinema } = useCinema();
    const currentCinema = cinemas.find((cinema: ICinema) => cinema._id === selectedCinema)?.name || 'Rạp không xác định';
    const getSelectedSeatsInfo = (): ISeat[] => {
        return selectedSeats.map(seatName => {
            const seatInfo = seats.find((seat: ISeat) => seat.name === seatName);
            if (!seatInfo) {
                return {
                    _id: '',
                    name: seatName,
                    seatTypeName: 'Ghế thường',
                    seatTypePrice: 55000,
                    room_id: '',
                    isBooked: false,
                    isSelecting: false
                };
            }
            return seatInfo;
        }).filter(Boolean) as ISeat[];
    };
    const calculateTicketPrice = (): number => {
        return getSelectedSeatsInfo().reduce((total, seat) => total + seat.seatTypePrice, 0);
    };

    useEffect(() => {
        if (movieId) {
            dispatch(getMovieById(movieId));
        }
    }, [movieId, dispatch]);

    useEffect(() => {
        if (selectedRoom) {
            dispatch(getSeatByRoomById(selectedRoom));
        }
    }, [selectedRoom, dispatch]);

    const handleContinueFromSeatSelection = () => {
        if (selectedSeats.length > 0) {
            setCurrentStep('combo-selection');
        } else {
            console.log('Chưa chọn ghế!');
            alert('Vui lòng chọn ít nhất một ghế!');
        }
    };

    const handleBackToSeatSelection = () => {
        setCurrentStep('seat-selection');
    };

    const handleContinueToPayment = (combos: ComboItem[], paymentInfo: PaymentInfo) => {
        setSelectedCombos(combos);
        setCurrentStep('payment');
        localStorage.setItem("selectedCombo", JSON.stringify(selectedCombos));

        const selectedSeatsInfo = getSelectedSeatsInfo();
        const ticketPrice = calculateTicketPrice();

        console.log('Proceeding to payment with:', {
            movie: movie?.name,
            seats: selectedSeatsInfo,
            combos: combos,
            paymentInfo: paymentInfo,
            ticketPrice: ticketPrice,
            total: calculateTotal(combos)
        });
    };

    const calculateTotal = (combos: ComboItem[]) => {
        const ticketPrice = calculateTicketPrice(); // Sử dụng giá thực tế
        const comboPrice = combos.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return ticketPrice + comboPrice;
    };

    if (!movie) return <div>Đang tải thông tin phim...</div>;

    if (currentStep === 'combo-selection') {
        const selectedSeatsInfo = getSelectedSeatsInfo();
        const ticketPrice = calculateTicketPrice();

        return (
            <Container>
                <Row>
                    <Col md={12}>
                        <div className={styles.breadcrumbWrapper}>
                            <span>Đặt vé </span>
                            <span>{'>'}</span>
                            <span>{movie.name}</span>
                            <span>{'>'}</span>
                            <span>Thanh toán</span>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col md={8}>
                        <ComboSelection
                            onBack={handleBackToSeatSelection}
                            onContinue={handleContinueToPayment}
                            selectedSeatsInfo={selectedSeatsInfo}
                            ticketPrice={ticketPrice}
                        />
                    </Col>
                    <Col md={4}>
                        <InfoMovie
                            movie={movie}
                            selectedTime={selectedTime}
                            selectedSeats={selectedSeats}
                            cinemaName={currentCinema}
                            onContinue={handleContinueFromSeatSelection}
                            showContinueButton={true}
                        />
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container>
            <Row>
                <Col md={12}>
                    <div className={styles.breadcrumbWrapper}>
                        <span>Đặt vé </span>
                        <span>{'>'}</span>
                        <span>{movie.name}</span>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col md={8}>
                    <SeatList
                        selectedSeats={selectedSeats}
                        setSelectedSeats={setSelectedSeats}
                        seats={seats}
                        showtimeId={showtimeId}
                    />
                </Col>
                <Col md={4}>
                    <InfoMovie
                        movie={movie}
                        selectedTime={selectedTime}
                        selectedSeats={selectedSeats}
                        cinemaName={currentCinema}
                        onContinue={handleContinueFromSeatSelection}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default SelectSeat;