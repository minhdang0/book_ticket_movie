import React, { useContext, useState, useEffect } from "react";
import styles from "./Header.module.scss";
import Navigation from "../Navigation/Navigation";
import Marquee from "../Marquee/Marquee";
import SearchForm from "../SearchForm/SearchForm";
import CinemaSelect from "../../../components/CinemaSelect";
import { useCinema } from "../../../contexts/CinemaContext";
import { SearchContext } from "../../../contexts/SearchContext";

const Header: React.FC = () => {
  const { setSelectedCinema } = useCinema()
  const { setSearchTerm } = useContext(SearchContext);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={styles.wrapper}>
      <Marquee />
      <div className={`${styles.stickyHeader} ${isScrolled ? styles.scrolled : ""}`}>
        <div className={styles.header__content}>
          <div>Logo</div>
          <CinemaSelect onChange={(cinemaId) => setSelectedCinema(cinemaId)} />
          <Navigation />
          <SearchForm onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>
    </header>
  );
};

export default Header;
