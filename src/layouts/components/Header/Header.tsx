import React, { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Header.module.scss";
import Navigation from "../Navigation/Navigation";
import Marquee from "../Marquee/Marquee";
import SearchForm from "../SearchForm/SearchForm";
import CinemaSelect from "../../../components/CinemaSelect";
import { SearchContext } from "../../../contexts/SearchContext";
import { useDispatch } from "react-redux";
import { getMovieBySearch } from "../../../features/movie/movieAsync";
import { setSelectedCinema } from "../../../features/cinema/cinemaSlice";
import logo from '../../../../public/movie-image/logo.png';

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { setSearchTerm } = useContext(SearchContext);
  const [isScrolled, setIsScrolled] = useState(false);

  // Get query from URL
  const searchParams = new URLSearchParams(location.search);
  const queryFromUrl = searchParams.get('q') || '';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load search results if query exists in URL
  useEffect(() => {
    if (queryFromUrl) {
      setSearchTerm(queryFromUrl);
      dispatch(getMovieBySearch(queryFromUrl) as any);
    }
  }, [queryFromUrl, setSearchTerm, dispatch]);

  const handleSearch = (query: string) => {
    setSearchTerm(query);

    if (query.trim()) {
      // Update URL with search query
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.set('q', query);
      navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });

      // Dispatch search action
      dispatch(getMovieBySearch(query) as any);
    } else {
      // Remove query from URL if empty
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.delete('q');
      const queryString = newSearchParams.toString();
      navigate(`${location.pathname}${queryString ? `?${queryString}` : ''}`, { replace: true });
    }
  };

  return (
    <header className={styles.wrapper}>
      <Marquee />
      <div className={`${styles.stickyHeader} ${isScrolled ? styles.scrolled : ""}`}>
        <div className={styles.header__content}>
          <div className={styles.logo_container}>
            <img src={logo} alt="logo" />
          </div>
          <CinemaSelect onChange={(cinemaId) => setSelectedCinema(cinemaId)} />
          <Navigation />
          <SearchForm
            initialValue={queryFromUrl}
            onChange={handleSearch}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;