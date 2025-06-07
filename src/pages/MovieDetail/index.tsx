import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Col, Container, Row } from 'reactstrap';
import { Table, notification } from 'antd';

import styles from './MovieDetail.module.scss';
import { IMovie } from '../../utils/interfaces/movie';
import { IUser } from '../../utils/interfaces/user';

import Schedule from '../../components/Schedule';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import { useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import useMovie from '../../hooks/useMovie';
import { getMovieById } from '../../features/movie/movieAsync';
import { getShowtimeByCinema } from '../../features/showtime/showtimeAsync';
import useCinema from '../../hooks/useCinema';
import { IShowtime } from '../../utils/interfaces/showtime';
import VideoTrailer from './../../components/VideoTrailer/index';
import Review from '../../components/Review';

type stateValue = {
    auth: {
        currentUser: IUser;
    };
};

const MovieDetail: React.FC = () => {
    const param = useParams();
    const navigate = useNavigate();
    const [movieInfo, setMovieInfo] = useState<IMovie>();
    const [selectedDay, setSelectedDay] = useState<Date>();
    const [selectedTime, setSelectedTime] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const { movie } = useMovie();
    const { selectedCinema } = useCinema();
    const user = useSelector((state: stateValue) => state.auth.currentUser);
    const { showtime } = useSelector((state: RootState) => state.showtime)
    const filterShowtime = showtime.filter((show: IShowtime) => show.movie_id == param.id);
    const trailerRef = useRef<HTMLDivElement | null>(null);

    const handleScrollToTrailer = () => {
        trailerRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(() => {
        const id = String(param.id);
        dispatch(getMovieById(id));
        dispatch(getShowtimeByCinema(selectedCinema))
    }, [dispatch, param]);

    useEffect(() => {
        if (movie) {
            setMovieInfo(movie);
        }
    }, [movie]);

    const handleSelectShowtime = (filterShowtime: IShowtime) => {
        if (!selectedCinema) {
            notification.warning({
                message: 'Vui lòng chọn rạp phim trước khi đặt vé',
                duration: 3,
            });
            return;
        }
        setSelectedDay(filterShowtime?.date);
        setSelectedTime(filterShowtime?.time);
        setConfirmOpen(true);
    };

    const handleConfirmClose = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setConfirmOpen(false);
    };

    const handleAgree = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setConfirmOpen(false);
        if (!user) {
            notification.error({
                placement: 'topRight',
                message: 'Không thể đặt vé',
                description: 'Bạn cần phải đăng nhập',
                duration: 3,
            });
        }
        localStorage.setItem('bookingInfo', JSON.stringify({ time: selectedTime }));
        navigate(`/select-seat/${movieInfo?._id}`);
    };


    const dataSource = [
        {
            key: '1',
            ngayChieu: selectedDay,
            gioChieu: selectedTime,
        },
    ];

    const columns = [
        {
            title: 'Ngày chiếu',
            dataIndex: 'ngayChieu',
            key: 'ngayChieu',
            align: 'center' as const,
        },
        {
            title: 'Giờ chiếu',
            dataIndex: 'gioChieu',
            key: 'gioChieu',
            align: 'center' as const,
        },
    ];

    const formatDate = (date?: Date) => {
        if (!date) return 'Chưa rõ';
        const d = new Date(date);
        return d.toLocaleDateString('vi-VN');
    };

    return (
        <Container>
            <Row>
                <div className={styles.movie__info}>
                    <img src={movieInfo?.image} alt={movieInfo?.name} />
                    <div className={styles.movie__content}>
                        <h3>{movieInfo?.name}</h3>
                        <p>{movieInfo?.description}</p>
                        <span><strong>Thể loại:</strong> {movieInfo?.categories && Array.isArray(movieInfo.categories)
                            ? movieInfo.categories.join(', ')
                            : 'Chưa rõ'}</span>
                        <span><strong>Đạo diễn:</strong> {movieInfo?.director}</span>
                        <span><strong>Độ tuổi cho phép:</strong> {movieInfo?.ageAllowed}</span>
                        <span><strong>Thời lượng:</strong> {movieInfo?.duration} phút</span>
                        <span><strong>Ngày chiếu:</strong> {formatDate(movieInfo?.releaseDate)}</span>
                    </div>
                </div>
            </Row>

            <Row>
                <div className={styles.schedule__movie}>
                    <div className={styles.schedule__content}>
                        <Schedule showtimeData={filterShowtime} onSelectShowtime={handleSelectShowtime} />
                    </div>
                </div>
            </Row>
            <Row className={styles.trailer_container}>
                <Col lg='12' className={styles.trailer_title}>
                    <h1 onClick={handleScrollToTrailer}>Trailer</h1>
                </Col >
                {movieInfo?.trailer && (
                    <div ref={trailerRef}>
                        <Col lg='12' className={styles.trailer}>
                            <VideoTrailer trailerUrl={movieInfo.trailer} movieName={movieInfo.name || ''} />
                            <Review movieId={String(param.id)} currentUser={user} />
                        </Col>
                    </div>
                )}

            </Row>

            <Modal isOpen={confirmOpen} onCLose={handleConfirmClose}>
                <div className={styles.confirm__content}>
                    <div className={styles.confirm__title}>
                        <h3>Xác nhận mua vé</h3>
                    </div>
                    <div className={styles.detail__showtime}>
                        <h3>{movieInfo?.name}</h3>
                        <Table
                            columns={columns}
                            dataSource={dataSource}
                            pagination={false}
                            bordered={false}
                        />
                        <Button className={styles.btn__accept} onClick={handleAgree}>ĐỒNG Ý</Button>
                    </div>
                </div>
            </Modal>
        </Container>
    );
};

export default MovieDetail;
