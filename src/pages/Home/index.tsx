import React, { useEffect, useState } from 'react'
import Slider from './components/Slider/Slider';
import { Col, Container, Row } from 'reactstrap';
import MovieList from '../../components/ProductList/MovieList';
import '@ant-design/v5-patch-for-react-19';
import { useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getAllMovies, getMovieByCinema } from '../../features/movie/movieAsync';
import { useSelector } from 'react-redux';
import styles from './Home.module.scss';
import billService from '../../services/billService';

type MovieStats = {
  name: string;
  count: number; // {"tên phim": count}
}

const Home: React.FC = () => {
  const { selectedCinema } = useSelector((state: RootState) => state.cinema);
  const { movies, moviesCinema, loading, error } = useSelector((state: RootState) => state.movie);
  const dispatch = useDispatch<AppDispatch>();
  const [movieStats, setMovieStats] = useState<MovieStats[]>([]);

  // Hàm sắp xếp phim theo movieStats
  const sortMoviesByStats = (movies: any[], stats: { name: string, count: number }[]) => {
    if (!stats || stats.length === 0) {
      return movies;
    }

    const movieNamesInOrder = stats.map(statItem => statItem.name);

    const sortedMovies = [...movies].sort((a, b) => {
      const indexA = movieNamesInOrder.indexOf(a.name);
      const indexB = movieNamesInOrder.indexOf(b.name);

      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return 0;
    });

    return sortedMovies;
  };


  useEffect(() => {
    (async () => {
      try {
        const movieStats = await billService.getMoiveStats();
        console.log('Movie Stats:', movieStats); // Debug
        setMovieStats(movieStats);
      } catch (error) {
        console.log('Error fetching movie stats:', error);
      }
    })();
  }, []); // Thêm dependency array rỗng

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

  // Determine which movies to display và sắp xếp theo stats
  const baseMovies = selectedCinema && moviesCinema?.length > 0
    ? moviesCinema
    : movies || [];

  // Sắp xếp phim theo thống kê
  const displayMovies = sortMoviesByStats(baseMovies, movieStats);

  // Debug log
  // useEffect(() => {
  //   if (movieStats.length > 0 && displayMovies.length > 0) {
  //     console.log('Original movies:', baseMovies.map(m => m.name));
  //     console.log('Movie stats order:', movieStats.map(stat => Object.keys(stat)[0]));
  //     console.log('Sorted movies:', displayMovies.map(m => m.name));
  //   }
  // }, [movieStats, displayMovies]);

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
      <Row >
        <Col lg='12'>
          <h1 className={styles.title}>Được xem nhiều nhất</h1>
          <MovieList movies={displayMovies} />
        </Col>
      </Row>
    </Container>
  );
};

export default Home;