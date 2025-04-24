import React from 'react'
import MovieList from '../../components/ProductList/MovieList'
import { moviesData } from '../../utils/data/movieData'
import { Container, Row } from 'reactstrap'

type Props = {}

const Movie: React.FC<Props> = () => {
  return (
    <>
      <Container>
        <Row>
          <MovieList movies={moviesData} />
        </Row>
      </Container>
    </>
  )
}

export default Movie