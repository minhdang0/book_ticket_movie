import React, { useEffect, useState } from 'react';
import { IMovie } from './../../utils/interfaces/movie';
import styles from './MovieCard.module.scss';
import Button from '../Button';
import Modal from '../Modal';
import Schedule from '../Schedule';
import { showtimeData } from '../../utils/data/showtimeData';
import { notification, Table } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { IUser } from '../../utils/interfaces/user';
import { useCinema } from '../../contexts/CinemaContext';
import CinemaSelect from '../CinemaSelect';

type Props = {
  movie: IMovie;
};
type stateValue = {
  auth: authState
}

type authState = {
  currentUser: IUser
}

const MovieCard: React.FC<Props> = ({ movie }) => {
  const [isOpen, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [openSelect, setOpenSelect] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const navigate = useNavigate();
  const user = useSelector((state: stateValue) => {
    return state.auth.currentUser
  })

  const { selectedCinema, setSelectedCinema } = useCinema();
  const filteredShowtime = showtimeData
    .filter((show) => show.cinemaId === selectedCinema && show.movieId === movie.id);


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

  useEffect(() => {
    if (selectedCinema) setOpenSelect(false);
  }, [selectedCinema])
  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (selectedCinema === null) {
      notification.error({
        message: 'Vui lòng chọn rạp phim',
        duration: 3
      })
      setOpenSelect(true);
      return
    }
    setOpen(true);
  }

  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setOpen(false);
  }

  const handleSelectShowtime = (day: string, time: string) => {
    setSelectedDay(day);
    setSelectedTime(time);
    setConfirmOpen(true);
  }

  const handleConfirmClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setConfirmOpen(false);
  }

  const handleAgree = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setConfirmOpen(false);
    setOpen(false);
    if (!user) {
      notification.error({
        placement: 'topRight',
        message: 'Không thể đặt vé',
        description: 'Bạn cần phải đăng nhập',
        duration: 3
      })
      localStorage.setItem('bookingInfo', JSON.stringify({
        time: selectedTime
      }));
    }
    navigate(`/select-seat/${movie.id}`, {
      state: { selectedTime }
    });
  }

  const handleSelectCinema = () => {
    setOpenSelect(false)
  }

  return (
    <>
      <div className={styles.movie__card}>
        {/* movie content */}
        <div className={styles.movie__image}>
          <img src={movie.image} alt={movie.name} />
        </div>
        <div className={`${styles.movie__content} mt-2`}>
          <Link to={`/movie/${movie.id}`} >  <h3 className={styles.movie__title}>{movie.name}</h3></Link>
          <p className={styles.movie__info}><span>Thời lượng:</span> {movie.duration} phút</p>
          <p className={styles.movie__info}><span>Thể loại:</span> {movie.category.join(", ")}</p>
          <Button className={styles.movie__button} onClick={handleOpen}>Mua vé</Button>
        </div>
      </div>

      <Modal isOpen={openSelect} onCLose={handleSelectCinema}>
        <div className={styles.schedule__title}>
          <h3>Chọn rạp chiếu phim</h3>
        </div>
        <CinemaSelect onChange={(cinemaID) => setSelectedCinema(cinemaID)} />
      </Modal>
      <Modal isOpen={isOpen} onCLose={handleClose}>
        <div className={styles.schedule__title}>
          <h3>LỊCH CHIẾU - {movie.name}</h3>
        </div>
        <div className={styles.schedule__content}>
          <Schedule showtimeData={filteredShowtime} onSelectShowtime={handleSelectShowtime} />
        </div>
      </Modal>

      <Modal isOpen={confirmOpen} onCLose={handleConfirmClose}>
        <div className={styles.confirm__content}>
          <div className={styles.confirm__title}>
            <h3>Xác nhận mua vé</h3>
          </div>
          <div className={styles.detail__showtime} >
            <h3>{movie.name}</h3>
            <Table
              columns={columns}
              dataSource={dataSource}
              pagination={false}
              bordered={false}

            />
            <Button className={styles.btn__accept} onClick={handleAgree}>ĐỒNG Ý</Button>
          </div>
        </div>
      </Modal >
    </>
  );
};

export default MovieCard;