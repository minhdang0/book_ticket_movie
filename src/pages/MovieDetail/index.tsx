import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Row } from 'reactstrap';
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

type stateValue = {
    auth: {
        currentUser: IUser;
    };
};

const MovieDetail: React.FC = () => {
    const param = useParams();
    const navigate = useNavigate();
    const [movieInfo, setMovieInfo] = useState<IMovie>();
    const [selectedDay, setSelectedDay] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const { currentMovie } = useMovie();
    const { selectedCinema } = useCinema();
    const user = useSelector((state: stateValue) => state.auth.currentUser);
    const { showtime } = useSelector((state: RootState) => state.showtime)
    const filterShowtime = showtime.filter((show: IShowtime) => show.movie_id == param.id)

    useEffect(() => {
        const id = String(param.id);
        dispatch(getMovieById(id));
        dispatch(getShowtimeByCinema(selectedCinema))
    }, [dispatch, param]);

    useEffect(() => {
        if (currentMovie) {
            setMovieInfo(currentMovie);
        }
    }, [currentMovie]);

    console.log(movieInfo)
    const handleSelectShowtime = (day: string, time: string) => {
        if (!selectedCinema) {
            notification.warning({
                message: 'Vui lòng chọn rạp phim trước khi đặt vé',
                duration: 3,
            });
            return;
        }
        setSelectedDay(day);
        setSelectedTime(time);
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
        navigate(`/select-seat/${movieInfo?._id}`, {
            state: { selectedTime },
        });
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
                        <span><strong>Thể loại:</strong> {movieInfo?.categories.join(', ')}</span>
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
