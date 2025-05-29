import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import styles from './SearchForm.module.scss';

type Props = {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
};

const SearchForm: React.FC<Props> = ({ onChange, onSubmit }) => {
    return (
        <form onSubmit={onSubmit} className={styles.search__form}>
            <input
                placeholder="Tìm kiếm phim"
                type="text"
                onChange={onChange}
                style={{ color: "black" }}
            />
            <button type="submit">
                <FontAwesomeIcon icon={faSearch} />
            </button>
        </form>
    );
};

export default SearchForm;
