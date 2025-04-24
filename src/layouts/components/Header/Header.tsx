import React from "react";
import styles from "./Header.module.scss";
import Navigation from "../Navigation/Navigation";
import Marquee from "../Marquee/Marquee";
import SearchForm from "../SearchForm/SearchForm";
import { Container } from "reactstrap";
import CinemaSelect from "../../../components/CinemaSelect";
import { useCinema } from "../../../contexts/CinemaContext";

const Header: React.FC = () => {
  const { setSelectedCinema } = useCinema()

  return (
    <header className={styles.wrapper}>
      <Marquee />
      <Container>
        <div className={styles.header__content}>
          <div>Logo</div>
          <CinemaSelect onChange={(cinemaId) => setSelectedCinema(cinemaId)} />
          <Navigation />
          <SearchForm />
        </div>
      </Container>
    </header>
  );
};

export default Header;
