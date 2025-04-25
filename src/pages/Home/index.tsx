import React, { useEffect } from 'react'
import Slider from './components/Slider/Slider';
import { Container, Row } from 'reactstrap';
import { moviesData } from '../../utils/data/movieData';
import MovieList from '../../components/ProductList/MovieList';
import '@ant-design/v5-patch-for-react-19';
import { showtimeData } from '../../utils/data/showtimeData';
import { useCinema } from '../../contexts/CinemaContext';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { getCurrentUser } from '../../features/auth/authAsync';
import * as authService from '../../services/authService';

const Home: React.FC = () => {
  const { selectedCinema } = useCinema();

  const filteredMovieIds = showtimeData
    .filter((showtime) => showtime.cinemaId === selectedCinema)
    .map((s) => s.movieId);

  const uniqueMovieIds = Array.from(new Set(filteredMovieIds));

  const filteredMovies = selectedCinema
    ? moviesData.filter((movie) => uniqueMovieIds.includes(movie.id))
    : moviesData;

  const dispatch = useDispatch<AppDispatch>()
  useEffect(() => {
    dispatch(getCurrentUser());
    authService.getAllUser();
  })
  return (
    <>
      <Container>
        <Row >
          <Slider />
        </Row>
        <Row >
          <MovieList movies={filteredMovies} />
        </Row>
      </Container>
    </>
  )
}

export default Home