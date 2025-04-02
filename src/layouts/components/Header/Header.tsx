import React from 'react'
import styles from './Header.module.scss';
import Navigation from '../Navigation/Navigation';
import Marquee from '../Marquee/Marquee';
import SearchForm from '../SearchForm/SearchForm';
import { Container } from 'reactstrap';


type Props = {}

const Header: React.FC<Props> = () => {
  return (
    <header className={styles.wrapper}>
      <Marquee />
      <Container>
        <div className={styles.header__content}>
          <div >
            Logo
          </div>
          <Navigation />
          <SearchForm  />
        </div>
      </Container>
    </header>
  )
}

export default Header