import React from 'react'
import Slider from './components/Slider/Slider';
import { Container, Row } from 'reactstrap';
import { moviesData } from '../../utils/data/movieData';
import MovieList from '../../components/ProductList/MovieList';

type Props = {

}

const Home:React.FC<Props> = () =>  {
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