import { useSelector } from 'react-redux';
import { RootState } from '../store';

function useCinema() {
    const { cinemas, selectedCinema, currentCinema, loading, error } = useSelector((state: RootState) => state.cinema);

    return { cinemas, selectedCinema, currentCinema, loading, error }
}


export default useCinema;