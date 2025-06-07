import React, { useEffect } from 'react'
import MovieList from '../../components/ProductList/MovieList'
import { Container, Row } from 'reactstrap'
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from '../../store'
import { getMovieByCinema } from '../../features/movie/movieAsync'
import { useSelector } from 'react-redux'

type Props = {}

const Movie: React.FC<Props> = () => {
  const { selectedCinema } = useSelector((state: RootState) => state.cinema);
  const { movies, moviesCinema } = useSelector((state: RootState) => state.movie);
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    if (selectedCinema) {
      dispatch(getMovieByCinema(selectedCinema));
    }
  }, [selectedCinema, dispatch]);

  // Determine which movies to display
  const displayMovies = selectedCinema && moviesCinema?.length > 0
    ? moviesCinema
    : movies || [];
  return (
    <>
      <Container>
        <Row>
          <MovieList movies={displayMovies} />
        </Row>
      </Container>
    </>
  )
}

export default Movie