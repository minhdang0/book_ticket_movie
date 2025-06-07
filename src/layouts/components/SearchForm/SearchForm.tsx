import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import styles from './SearchForm.module.scss';
import useDebounce from "../../../hooks/useDebounce";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { RootState } from "../../../store";
import { IMovie } from "../../../utils/interfaces/movie";

type Props = {
    initialValue?: string;
    onChange: (query: string) => void;
    onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
};

const SearchForm: React.FC<Props> = ({ initialValue = '', onChange, onSubmit }) => {
    const navigate = useNavigate();
    const [searchValue, setSearchValue] = useState(initialValue);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { movieBySearch, loading } = useSelector((state: RootState) => state.movie);

    const debouncedSearchValue = useDebounce(searchValue, 300);

    useEffect(() => {
        setSearchValue(initialValue);
    }, [initialValue]);

    // Trigger search when debounced value changes
    useEffect(() => {
        if (debouncedSearchValue !== initialValue) {
            onChange(debouncedSearchValue);
        }
    }, [debouncedSearchValue, onChange, initialValue]);

    // Show/hide dropdown based on search results and focus
    useEffect(() => {
        setIsDropdownOpen(isFocused && searchValue.length > 0 && movieBySearch.length > 0);
    }, [isFocused, searchValue, movieBySearch]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
                setIsFocused(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);

        if (value.length === 0) {
            setIsDropdownOpen(false);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit(e);
        }
        setIsDropdownOpen(false);
        inputRef.current?.blur();
    };

    const handleMovieClick = (movie: IMovie) => {
        setIsDropdownOpen(false);
        setIsFocused(false);
        navigate(`/movie/${movie._id}`);
    };

    const handleClearSearch = () => {
        setSearchValue('');
        onChange('');
        inputRef.current?.focus();
    };

    const handleInputFocus = () => {
        setIsFocused(true);
        if (searchValue.length > 0 && movieBySearch.length > 0) {
            setIsDropdownOpen(true);
        }
    };

    return (
        <div className={styles.search__container} ref={searchRef}>
            <form onSubmit={handleSubmit} className={styles.search__form}>
                <input
                    ref={inputRef}
                    placeholder="Tìm kiếm phim"
                    type="text"
                    value={searchValue}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    style={{ color: "black" }}
                    className={styles.search__input}
                />

                {searchValue && (
                    <button
                        type="button"
                        onClick={handleClearSearch}
                        className={styles.clear__button}
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                )}

                <button type="submit" className={styles.search__button}>
                    <FontAwesomeIcon icon={faSearch} />
                </button>
            </form>

            {/* Search Results Dropdown */}
            {isDropdownOpen && (
                <div className={styles.search__dropdown}>
                    {loading ? (
                        <div className={styles.search__loading}>
                            <span>Đang tìm kiếm...</span>
                        </div>
                    ) : (
                        <ul className={styles.search__results}>
                            {movieBySearch.map((movie: IMovie) => (
                                <li
                                    key={movie._id}
                                    className={styles.search__result_item}
                                    onClick={() => handleMovieClick(movie)}
                                >
                                    <div className={styles.movie__info}>
                                        <Link to={`/movie/${movie._id}`} >{movie.name}</Link>
                                    </div>
                                </li>
                            ))}

                            {movieBySearch.length === 0 && (
                                <li className={styles.no__results}>
                                    Không tìm thấy phim nào
                                </li>
                            )}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchForm;