import { useSelector } from "react-redux";
import { RootState } from "../store";

function useMovie() {
    const { movies, moviesCinema, currentMovie, loading, error } = useSelector((state: RootState) => state.movie);
    return { movies, moviesCinema, currentMovie, loading, error }
}

export default useMovie;