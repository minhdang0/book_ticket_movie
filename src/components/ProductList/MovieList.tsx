import React from 'react'
import { IMovie } from './../../utils/interfaces/movie';
import styles from './MovieList.module.scss';
import { Row, Col } from 'reactstrap';
import MovieCard from './../MovieCard/MovieCard';

// Error Boundary cho MovieCard
class MovieCardErrorBoundary extends React.Component<
  { children: React.ReactNode; movieName?: string },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; movieName?: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('MovieCard Error:', error, errorInfo);
    console.error('Movie causing error:', this.props.movieName);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card h-100 d-flex align-items-center justify-content-center">
          <div className="card-body text-center">
            <p className="text-muted">Lỗi hiển thị phim</p>
            {this.props.movieName && <small>{this.props.movieName}</small>}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

type Props = {
  movies: IMovie[]
}

const MovieList: React.FC<Props> = ({ movies }) => {
  console.log('Movies received:', movies);

  if (!movies || movies.length === 0) {
    return (
      <Row>
        <Col>
          <p>Không có kết quả để hiển thị</p>
        </Col>
      </Row>
    );
  }

  // Lọc ra những movie có dữ liệu cơ bản
  const validMovies = movies.filter((movie, index) => {
    if (!movie) {
      console.warn(`Movie at index ${index} is null/undefined`);
      return false;
    }
    if (!movie.name) {
      console.warn(`Movie at index ${index} missing name:`, movie);
      return false;
    }
    return true;
  });

  if (validMovies.length === 0) {
    return (
      <Row>
        <Col>
          <p>Không có phim hợp lệ để hiển thị</p>
        </Col>
      </Row>
    );
  }

  return (
    <>
      <Row className={`${styles.movie__list} mt-5`}>
        {validMovies.map((movie, index) => (
          <Col lg="3" md="4" sm="6" xs="12" key={movie._id || index} className="mb-4">
            <MovieCardErrorBoundary movieName={movie.name}>
              <MovieCard movie={movie} />
            </MovieCardErrorBoundary>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default MovieList;