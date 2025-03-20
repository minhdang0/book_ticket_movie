import React from 'react'
import Slider from '../../components/Slider/Slider';
import { Container, Row } from 'reactstrap';

type Props = {

}

const Home:React.FC<Props> = () =>  {
  return (
    <>
      <Container>
        <Row >
          <Slider />
        </Row>
      </Container>
    </>
  )
}

export default Home