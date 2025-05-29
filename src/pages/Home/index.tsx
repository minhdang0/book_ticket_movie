import React, { useEffect } from 'react'
import Slider from './components/Slider/Slider';
import { Container, Row } from 'reactstrap';
import MovieList from '../../components/ProductList/MovieList';
import '@ant-design/v5-patch-for-react-19';
import { useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getAllMovies, getMovieByCinema } from '../../features/movie/movieAsync';
import { useSelector } from 'react-redux';

const Home: React.FC = () => {
  const { selectedCinema } = useSelector((state: RootState) => state.cinema);
  const { movies, moviesCinema, loading, error } = useSelector((state: RootState) => state.movie);
  const dispatch = useDispatch<AppDispatch>();

  // Load all movies on component mount
  useEffect(() => {
    dispatch(getAllMovies());
  }, [dispatch]);

  // Load movies by cinema when selectedCinema changes
  useEffect(() => {
    if (selectedCinema) {
      dispatch(getMovieByCinema(selectedCinema));
    }
  }, [selectedCinema, dispatch]);

  // Determine which movies to display
  const displayMovies = selectedCinema && moviesCinema?.length > 0
    ? moviesCinema
    : movies || [];

  if (loading) {
    return (
      <Container>
        <div className="text-center p-4">Đang tải phim...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="alert alert-danger">Lỗi: {error}</div>
      </Container>
    );
  }

  return (
    <Container>
      <Row>
        <Slider />
      </Row>
      <Row>
        <MovieList movies={displayMovies} />
      </Row>
    </Container>
  );
};

export default Home;