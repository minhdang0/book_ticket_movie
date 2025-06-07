import { useSelector } from "react-redux";
import { RootState } from "../store";

function useMovie() {
    const { movies, moviesCinema, currentMovie, movie, loading, error } = useSelector((state: RootState) => state.movie);
    return { movies, moviesCinema, currentMovie, movie, loading, error }
}

export default useMovie;