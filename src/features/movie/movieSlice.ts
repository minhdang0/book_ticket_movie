import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IMovie } from '../../utils/interfaces/movie';
import { getAllMovies, getMovieByCinema, getMovieById } from './movieAsync';



interface MovieState {
    movies: IMovie[];
    moviesCinema: IMovie[];
    currentMovie: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: MovieState = {
    movies: [],
    moviesCinema: [],
    currentMovie: null,
    loading: false,
    error: null,
};

const movieSlice = createSlice({
    name: 'movie',
    initialState,
    reducers: {
        setSelectedMovie: (state, action: PayloadAction<string | null>) => {
            state.currentMovie = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {

        // Handle getAllMovies
        builder
            .addCase(getAllMovies.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllMovies.fulfilled, (state, action) => {
                state.loading = false;
                state.movies = action.payload;
            })
            .addCase(getAllMovies.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Handle getMovieId
            .addCase(getMovieById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMovieById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentMovie = action.payload;
            })
            .addCase(getMovieById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Handle getMovieByCinema
            .addCase(getMovieByCinema.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMovieByCinema.fulfilled, (state, action) => {
                state.loading = false;
                state.moviesCinema = action.payload;
            })
            .addCase(getMovieByCinema.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

    },
});

export const { setSelectedMovie, clearError } = movieSlice.actions;
export default movieSlice.reducer;