import React from 'react';
import { IMovie } from './../../utils/interfaces/movie';
import styles from './MovieCard.module.scss';

type Props = {
  movie: IMovie;
};

const MovieCard: React.FC<Props> = ({ movie }) => {
  return (
    <div className={styles.movie__card}>
      <div className={styles.movie__image}>
        <img src={movie.image} alt={movie.name} />
      </div>
      <div className={`${styles.movie__content} mt-2`}>
        <h3 className={styles.movie__title}>{movie.name}</h3>
        <p className={styles.movie__info}><span>Thời lượng:</span> {movie.duration} phút</p>
        <p className={styles.movie__info}><span>Thể loại:</span> {movie.category.join(", ")}</p>
        <button className={styles.movie__button}>Mua vé</button>
      </div>
    </div>
  );
};

export default MovieCard;
