import { useSelector } from 'react-redux';
import { RootState } from '../store';

function useCinema() {
    const { cinemas, selectedCinema, loading, error } = useSelector((state: RootState) => state.cinema);

    return { cinemas, selectedCinema, loading, error }
}


export default useCinema;