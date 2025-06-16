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
import Loading from '../../components/Loading/Loading';
import useCurrentUser from '../../hooks/useCurrentUser';

type MovieStats = {
  name: string;
  count: number; // {"tên phim": count}
}

const Home: React.FC = () => {
  const { selectedCinema } = useSelector((state: RootState) => state.cinema);
  const { movies, moviesCinema, loading, error } = useSelector((state: RootState) => state.movie);
  const [isLoadingStats, setIsLoadingStats] = useState(true); // Loading riêng cho stats
  const [movieStats, setMovieStats] = useState<MovieStats[]>([]);
  const [displayMovies, setDisplayMovies] = useState<any[]>([]); // State cho movies đã được sắp xếp
  const currentUser = useCurrentUser();
  const dispatch = useDispatch<AppDispatch>();

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
  console.log(movieStats)
  // Load movie stats
  useEffect(() => {
    (async () => {
      setIsLoadingStats(true);
      try {
        const movieStats = await billService.getMovieRecommendations(currentUser._id);
        console.log('Movie Stats:', movieStats)

        setMovieStats(movieStats);
      } catch (error) {
        console.log('Error fetching movie stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    })();
  }, []);

  useEffect(() => {
    dispatch(getAllMovies());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCinema) {
      dispatch(getMovieByCinema(selectedCinema));
    }
  }, [selectedCinema, dispatch]);

  useEffect(() => {
    if (!isLoadingStats) {
      const baseMovies = selectedCinema && moviesCinema?.length > 0
        ? moviesCinema
        : movies || [];

      const sortedMovies = sortMoviesByStats(baseMovies, movieStats);
      setDisplayMovies(sortedMovies);
    }
  }, [movies, moviesCinema, selectedCinema, movieStats, isLoadingStats]);

  if (loading || isLoadingStats) {
    return (
      <Container>
        <div className="text-center p-4">
          {loading && <Loading />}
          {isLoadingStats && <Loading />}
        </div>
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
        <Col lg='12'>
          <h1 className={styles.title}>Được xem nhiều nhất</h1>
          {displayMovies.length > 0 ? (
            <MovieList movies={displayMovies} />
          ) : (
            <div className="text-center p-4">Không có phim nào để hiển thị</div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Home;