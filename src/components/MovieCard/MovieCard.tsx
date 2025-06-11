import React, { useEffect, useState } from 'react';
import { IMovie } from './../../utils/interfaces/movie';
import styles from './MovieCard.module.scss';
import Button from '../Button';
import Modal from '../Modal';
import Schedule from '../Schedule';
import { notification, Table } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { IUser } from '../../utils/interfaces/user';
import CinemaSelect from '../CinemaSelect';
import useCinema from '../../hooks/useCinema';
import { useDispatch } from 'react-redux';
import { setSelectedCinema } from '../../features/cinema/cinemaSlice';
import { AppDispatch, RootState } from '../../store';
import { getShowtimeByCinema } from '../../features/showtime/showtimeAsync';
import { setSelectedMovie } from '../../features/movie/movieSlice';
import { IShowtime } from '../../utils/interfaces/showtime';
import { setSelectedRoom } from '../../features/room/roomSlice';
import { setCurrentShowtime } from '../../features/showtime/showtimeSlice';
import VideoTrailer from '../VideoTrailer';

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
  const [confirmTrailer, setConfirmTrailer] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const navigate = useNavigate();

  const user = useSelector((state: stateValue) => {
    return state.auth.currentUser
  })

  const { showtime } = useSelector((state: RootState) => state.showtime);
  const { currentMovie } = useSelector((state: RootState) => state.movie);
  const { selectedCinema } = useCinema();
  const dispatch = useDispatch<AppDispatch>();

  const filterShowtime = showtime.filter((show: IShowtime) => show.movie_id === currentMovie);

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
    if (selectedCinema) {
      setOpenSelect(false);
      dispatch(getShowtimeByCinema(selectedCinema));
      console.log(showtime)
    }
  }, [dispatch, selectedCinema])


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
    dispatch(setSelectedMovie(movie._id));
    setOpen(true);

  }


  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setOpen(false);
  }

  const handleSelectShowtime = (show: IShowtime) => {
    setSelectedDay(new Date(show.date).toLocaleDateString('vi-VN'));
    setSelectedTime(show.time);
    dispatch(setCurrentShowtime(show));
    if (show.room_id) {
      dispatch(setSelectedRoom(show.room_id));
    } else {
      console.warn("Showtime không có room_id!");
    }

    setConfirmOpen(true);
  };
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
    navigate(`/select-seat/${movie._id}`, {
      state: { selectedTime }
    });
  }

  const handleSelectCinema = () => {
    setOpenSelect(false)
  }

  const handleOpenTrailer = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmTrailer(true);
  }

  const handleCloseTrailer = () => {
    setConfirmTrailer(false);
  }

  if (!movie) return null;
  return (
    <>
      <div className={styles.movie__card}>
        {/* movie content */}
        <div className={styles.movie__image}>
          <img src={movie.image} alt={movie.name} />
          <div className={styles.trailer__overlay}>
            <button
              className={styles.trailer__button}
              onClick={handleOpenTrailer}
              aria-label="Xem trailer"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
        <div className={`${styles.movie__content} mt-2`}>
          <Link to={`/movie/${movie._id}`} >  <h3 className={styles.movie__title}>{movie.name}</h3></Link>
          <p className={styles.movie__info}><span>Thời lượng:</span> {movie.duration} phút</p>
          <p className={styles.movie__info}><span>Thể loại:</span> {movie.categories.join(", ")}</p>
          <Button className={styles.movie__button} onClick={handleOpen}>Mua vé</Button>
        </div>
      </div>

      <Modal isOpen={openSelect} onCLose={handleSelectCinema}>
        <div className={styles.schedule__title}>
          <h3>Chọn rạp chiếu phim</h3>
        </div>
        <CinemaSelect onChange={(cinemaID) => dispatch(setSelectedCinema(cinemaID))} />
      </Modal>
      <Modal isOpen={isOpen} onCLose={handleClose}>
        <div className={styles.schedule__title}>
          <h3>LỊCH CHIẾU - {movie.name}</h3>
        </div>
        <div className={styles.schedule__content}>
          <Schedule showtimeData={filterShowtime} onSelectShowtime={handleSelectShowtime} />
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
      <Modal isOpen={confirmTrailer} onCLose={handleCloseTrailer}>
        <h2 className={styles.trailer_modal}>Trailer phim {movie.name}</h2>
        {movie.trailer && <VideoTrailer trailerUrl={movie?.trailer} movieName={movie.name} />}
      </Modal>
    </>
  );
};

export default MovieCard;