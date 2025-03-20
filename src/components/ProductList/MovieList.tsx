import React from 'react'
import { IMovie } from './../../utils/interfaces/movie';
import styles from './MovieList.module.scss';
import { Col } from 'reactstrap';

type Props = {
    movies: IMovie[]
}

const   MovieList: React.FC<Props> = ({ movies }) => {
  return (
    <>
       <div className={styles.movie__card}>
            {movies.map((movie, index) => (
                <Col lg='3' className={`${styles.movie_item} mb-4`} key={index}>
                    <div className={styles.movie__image}>
                    </div>
                    <h3>{movie.name}</h3>
                    <p>Thời lương {movie.duration} phút</p>
                    <p>Thể loại {movie.category}</p>
                </Col>
            ))}
        </div>
    </>
  )
}

export default  MovieList
