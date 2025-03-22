import React from 'react'
import { IMovie } from './../../utils/interfaces/movie';
import styles from './MovieList.module.scss';
import { Row,Col } from 'reactstrap';
import MovieCard from './../MovieCard/MovieCard';

type Props = {
    movies: IMovie[]
}

const   MovieList: React.FC<Props> = ({ movies }) => {
  return (
    <>
      <Row className={`${styles.movie__list} mt-5`}>
          {movies.map((movie, index) => (
            <Col lg="3" md="4" sm="6" xs="12"  key={index} className="mb-4">
              <MovieCard movie={movie} />
            </Col>
          ))}
      </Row>
    </>
  )
}

export default  MovieList
