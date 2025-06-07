import React from 'react';
import { IMovie } from '../../../../utils/interfaces/movie';
import {
    faTags,
    faClock,
    faCalendarAlt,
    faFilm,
    faChair,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './InfoMovie.module.scss';
import Button from '../../../../components/Button';

type Props = {
    movie: IMovie;
    selectedTime: string;
    selectedSeats: string[];
    cinemaName: string;
    onContinue: () => void;
    showContinueButton?: boolean; // Thêm prop này để điều khiển hiển thị nút
};

const InfoMovie: React.FC<Props> = ({
    movie,
    selectedTime,
    selectedSeats,
    cinemaName,
    onContinue,
    showContinueButton = true // Mặc định hiển thị nút
}) => {

    const formatDate = (date?: Date) => {
        if (!date) return 'Chưa rõ';
        const d = new Date(date);
        return d.toLocaleDateString('vi-VN');
    };

    return (
        <div className={styles['info-movie']}>
            <div className={styles['info-movie__top']}>
                <div className={styles['info-movie__right']}>
                    <img src={movie.image} alt={movie.name} />
                </div>
                <div className={styles['info-movie__left']}>
                    <h3>{movie.name}</h3>
                    <p className={styles.subtitle}>2D Phụ đề</p>
                </div>
            </div>

            <table className={styles['info-table']}>
                <tbody>
                    <tr>
                        <td className={styles['label']}>
                            <FontAwesomeIcon icon={faTags} /> Thể loại
                        </td>
                        <td className={styles['value']}>
                            {Array.isArray(movie.categories) ? movie.categories.join(', ') : 'Chưa rõ'}
                        </td>
                    </tr>
                    <tr>
                        <td className={styles['label']}>
                            <FontAwesomeIcon icon={faClock} /> Thời lượng
                        </td>
                        <td className={styles['value']}>{movie.duration} phút</td>
                    </tr>

                    <tr>
                        <td className={styles['label']}>
                            <FontAwesomeIcon icon={faFilm} /> Rạp chiếu
                        </td>
                        <td className={styles['value']}>{cinemaName || ""}</td>
                    </tr>
                    <tr>
                        <td className={styles['label']}>
                            <FontAwesomeIcon icon={faCalendarAlt} /> Ngày chiếu
                        </td>
                        <td className={styles['value']}>{formatDate(movie.releaseDate)}</td>
                    </tr>
                    <tr>
                        <td className={styles['label']}>
                            <FontAwesomeIcon icon={faClock} /> Giờ chiếu
                        </td>
                        <td className={styles['value']}>{selectedTime}</td>
                    </tr>
                    <tr>
                        <td className={styles['label']}>
                            <FontAwesomeIcon icon={faFilm} /> Phòng chiếu
                        </td>
                        <td className={styles['value']}>{movie.screenRoom}</td>
                    </tr>
                    <tr>
                        <td className={styles['label']}>
                            <FontAwesomeIcon icon={faChair} /> Ghế ngồi
                        </td>
                        <td className={styles['value']}>
                            {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Chưa chọn'}
                        </td>
                    </tr>
                </tbody>
            </table>

            {showContinueButton && (
                <Button
                    className={styles['btn-continue']}
                    onClick={onContinue}
                    disabled={selectedSeats.length === 0}
                >
                    TIẾP TỤC
                </Button>
            )}
        </div>
    );
};

export default InfoMovie;