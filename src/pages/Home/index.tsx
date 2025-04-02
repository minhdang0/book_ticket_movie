import React from 'react'
import Slider from './components/Slider/Slider';
import { Container, Row } from 'reactstrap';
import { moviesData } from '../../utils/data/movieData';
import MovieList from '../../components/ProductList/MovieList';
import Loading from './../../components/Loading/Loading';
import useLoading from '../../hooks/useLoading';


type Props = {

}

const Home: React.FC<Props> = () => {
  const isLoading = useLoading();

  if (isLoading) return <Loading />;
  return (
    <>
      <Container>
        <Row >
          <Slider />
        </Row>
        <Row >
          <MovieList movies={moviesData} />
        </Row>
      </Container>
    </>
  )
}

export default Home