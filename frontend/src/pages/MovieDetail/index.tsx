import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Row } from 'reactstrap';
import { Table, notification } from 'antd';

import styles from './MovieDetail.module.scss';
import { moviesData } from '../../utils/data/movieData';
import { showtimeData } from '../../utils/data/showtimeData';
import { IMovie } from '../../utils/interfaces/movie';
import { IUser } from '../../utils/interfaces/user';

import Schedule from '../../components/Schedule';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import { useCinema } from '../../contexts/CinemaContext';

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

    const { selectedCinema } = useCinema();
    const user = useSelector((state: stateValue) => state.auth.currentUser);

    useEffect(() => {
        const id = Number(param.id);
        const foundMovie = moviesData.find((item) => item.id === id);
        setMovieInfo(foundMovie);
    }, [param]);

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
        navigate(`/select-seat/${movieInfo?.id}`, {
            state: { selectedTime },
        });
    };

    const filteredShowtime = showtimeData.filter(
        (show) => show.cinemaId === selectedCinema && show.movieId === movieInfo?.id
    );

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
                        <span><strong>Thể loại:</strong> {movieInfo?.category.join(', ')}</span>
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
                        <Schedule showtimeData={filteredShowtime} onSelectShowtime={handleSelectShowtime} />
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
