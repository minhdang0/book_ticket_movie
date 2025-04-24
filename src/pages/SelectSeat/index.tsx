import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Container, Row, Col } from 'reactstrap';
import SeatList from './component/SeatList';
import { moviesData } from '../../utils/data/movieData';
import InfoMovie from './component/InfoMovie';

const SelectSeat: React.FC = () => {
    const { movieId } = useParams<{ movieId: string }>();
    const [movie, setMovie] = useState<any>(null);
    const location = useLocation();
    const bookingInfoStr = localStorage.getItem('bookingInfo');
    const parsedBookingInfo = bookingInfoStr ? JSON.parse(bookingInfoStr) : null;
    const selectedTime = location.state?.selectedTime || parsedBookingInfo?.time;
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

    useEffect(() => {
        const id = Number(movieId);
        const foundMovie = moviesData.find((item) => item.id === id);
        setMovie(foundMovie || null);
    }, [movieId]);

    if (!movie) return <div>Đang tải thông tin phim...</div>;

    return (
        <Container>
            <Row>
                <Col md={8}>
                    <SeatList selectedSeats={selectedSeats} setSelectedSeats={setSelectedSeats} />
                </Col>
                <Col md={4}>
                    <InfoMovie movie={movie} selectedTime={selectedTime} selectedSeats={selectedSeats} />
                </Col>
            </Row>
        </Container>
    );
};

export default SelectSeat;
